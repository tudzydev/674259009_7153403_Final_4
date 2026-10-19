import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { Server } from "node:http";
import { Sequelize } from "sequelize";

// Never use an implicit .env DATABASE_URL for tests. Only local PostgreSQL is allowed.
const testUrl =
  process.env.TEST_DATABASE_URL ??
  "postgres://postgres:postgres@127.0.0.1:5433/event_db";
process.env.DATABASE_URL = testUrl;
process.env.DATABASE_PROVIDER = "local";
const enabled = process.env.RUN_DB_TESTS === "1";
const schema = `exam_test_${crypto.randomUUID().replaceAll("-", "")}`;
const suite = enabled ? describe : describe.skip;

suite(
  "Event API and PostgreSQL persistence (isolated temporary schema)",
  () => {
    let db: typeof import("../src/config/database").sequelize;
    let Event: typeof import("../src/models/eventModel").Event;
    let seedEvents: typeof import("../src/seeds/seedEvents").seedEvents;
    let server: Server;
    let origin: string;
    let createdId: number;
    const input = {
      title: "Exam 100%_Literal",
      organizer: "Test Organizer",
      category: "อบรม",
      eventDate: "2026-12-01",
      description: "Temporary integration test record",
      status: false,
    };
    type TestEvent = typeof input & {
      id: number;
      createdAt: string;
      updatedAt: string;
    };
    const list = async (response: Response) =>
      (await response.json()) as { data: TestEvent[] };
    const detail = async (response: Response) =>
      (await response.json()) as { data: TestEvent };
    const request = (path = "", init?: RequestInit) =>
      fetch(`${origin}/api/events${path}`, init);
    const jsonRequest = (method: string, body: unknown): RequestInit => ({
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    beforeAll(async () => {
      const host = new URL(testUrl).hostname;
      if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) {
        throw new Error(
          "Integration tests require local PostgreSQL; Production is prohibited",
        );
      }
      ({ sequelize: db } = await import("../src/config/database"));
      await db.authenticate();
      await db.query(`CREATE SCHEMA "${schema}"`);
      // Configure model defaults before importing models; Sequelize v6 exposes
      // options at runtime but omits it from its public TypeScript declarations.
      const options = (
        db as typeof db & { options: { define: { schema?: string } } }
      ).options;
      options.define = { ...options.define, schema };
      ({ Event } = await import("../src/models/eventModel"));
      ({ seedEvents } = await import("../src/seeds/seedEvents"));
      const { app } = await import("../src/app");
      await db.sync();
      server = await new Promise<Server>((resolve, reject) => {
        const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
        listener.on("error", reject);
      });
      const address = server.address();
      if (!address || typeof address === "string")
        throw new Error("No test port");
      origin = `http://127.0.0.1:${address.port}`;
    });

    afterAll(async () => {
      if (server)
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
      if (db) {
        try {
          await db.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        } finally {
          await db.close();
        }
      }
    });

    test("concurrent seeds create exactly 12 records once", async () => {
      expect(
        (await Promise.all([seedEvents(), seedEvents()])).sort((a, b) => a - b),
      ).toEqual([0, 12]);
      const response = await request();
      expect(response.status).toBe(200);
      const { data } = await list(response);
      expect(data).toHaveLength(12);
      for (const category of ["อบรม", "สัมมนา", "จิตอาสา"]) {
        const records = data.filter(
          (item: typeof input) => item.category === category,
        );
        expect(records).toHaveLength(4);
        expect(
          records.filter((item: typeof input) => item.status),
        ).toHaveLength(2);
      }
      expect(data.map((item: typeof input) => item.eventDate)).toEqual(
        data.map((item: typeof input) => item.eventDate).toSorted(),
      );
    });

    test("POST persists a draft and GET detail reads it", async () => {
      const response = await request(
        "",
        jsonRequest("POST", { ...input, ignored: "not stored" }),
      );
      expect(response.status).toBe(201);
      const { data } = await detail(response);
      createdId = data.id;
      expect(data).toMatchObject(input);
      expect(data).not.toHaveProperty("ignored");
      expect(data.createdAt).toBeString();
      expect((await detail(await request(`/${createdId}`))).data).toMatchObject(
        input,
      );
    });

    test("search matches title/organizer case-insensitively and combines category", async () => {
      const query = new URLSearchParams({
        search: "test organizer",
        category: "อบรม",
      });
      const { data } = await list(await request(`?${query}`));
      expect(data.map((item: { id: number }) => item.id)).toEqual([createdId]);
      const mismatch = new URLSearchParams({
        search: "test organizer",
        category: "สัมมนา",
      });
      expect((await list(await request(`?${mismatch}`))).data).toEqual([]);
    });

    test("search treats percent and underscore literally and handles empty search", async () => {
      expect(
        (await list(await request(`?${new URLSearchParams({ search: "%_" })}`)))
          .data,
      ).toHaveLength(1);
      expect(
        (
          await list(
            await request(`?${new URLSearchParams({ search: "   " })}`),
          )
        ).data,
      ).toHaveLength(13);
      expect((await list(await request("?search=no-such-event"))).data).toEqual(
        [],
      );
    });

    test("rejects invalid or repeated filters with 400", async () => {
      for (const query of [
        "?category=wrong",
        "?category=a&category=b",
        "?search=a&search=b",
      ]) {
        const response = await request(query);
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
          error: "Invalid event filters",
        });
      }
    });

    test("PUT stores changes and preserves status when omitted", async () => {
      const { status: _status, ...update } = {
        ...input,
        title: "Updated integration event",
      };
      const response = await request(
        `/${createdId}`,
        jsonRequest("PUT", update),
      );
      expect(response.status).toBe(200);
      expect((await detail(response)).data).toMatchObject({
        title: update.title,
        status: false,
      });
      expect((await detail(await request(`/${createdId}`))).data.title).toBe(
        update.title,
      );
    });

    test("data and seed marker persist across a fresh database connection", async () => {
      const fresh = new Sequelize(testUrl, {
        dialect: "postgres",
        logging: false,
      });
      try {
        const [rows] = await fresh.query(
          `SELECT title, status FROM "${schema}"."events" WHERE id = ${createdId}`,
        );
        expect(rows).toEqual([
          { title: "Updated integration event", status: false },
        ]);
        const [markers] = await fresh.query(
          `SELECT key FROM "${schema}"."seed_runs"`,
        );
        expect(markers).toEqual([{ key: "initial-events-v1" }]);
      } finally {
        await fresh.close();
      }
      expect(await seedEvents()).toBe(0);
      expect((await detail(await request(`/${createdId}`))).data.title).toBe(
        "Updated integration event",
      );
    });

    test("records survive two actual backend process startups without reseeding", async () => {
      const port = new URL(origin).port;
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
      try {
        for (let attempt = 0; attempt < 2; attempt++) {
          const child = Bun.spawn(
            [process.execPath, "run", "tests/fixtures/server.ts"],
            {
              env: { ...process.env, PORT: port, TEST_SCHEMA: schema },
              stdout: "ignore",
              stderr: "pipe",
            },
          );
          try {
            let ready = false;
            for (let retry = 0; retry < 100; retry++) {
              if (child.exitCode !== null)
                throw new Error("Test backend exited before becoming ready");
              try {
                const response = await request(`/${createdId}`);
                if (response.status === 200) {
                  expect((await detail(response)).data).toMatchObject({
                    title: "Updated integration event",
                    status: false,
                  });
                  ready = true;
                  break;
                }
              } catch {
                /* Server is still starting. */
              }
              await new Promise((resolve) => setTimeout(resolve, 20));
            }
            expect(ready).toBe(true);
            expect((await list(await request())).data).toHaveLength(13);
          } finally {
            child.kill();
            await child.exited;
          }
        }
      } finally {
        const { app } = await import("../src/app");
        server = await new Promise<Server>((resolve, reject) => {
          const listener = app.listen(Number(port), "127.0.0.1", () =>
            resolve(listener),
          );
          listener.on("error", reject);
        });
      }
    }, 10000);

    test("invalid input/date/JSON returns 400 and writes nothing", async () => {
      const before = await Event.count();
      for (const invalid of [
        {},
        { ...input, title: " " },
        { ...input, title: "a".repeat(151) },
        { ...input, organizer: "a".repeat(101) },
        { ...input, category: "wrong" },
        { ...input, description: "a".repeat(2001) },
        { ...input, status: "true" },
        { ...input, eventDate: "2026-02-30" },
        { ...input, eventDate: "0000-01-01" },
        { ...input, eventDate: "2026/12/01" },
      ]) {
        expect((await request("", jsonRequest("POST", invalid))).status).toBe(
          400,
        );
      }
      const malformed = await request("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      });
      expect(malformed.status).toBe(400);
      expect(await malformed.json()).toEqual({ error: "Invalid JSON request" });
      expect(await Event.count()).toBe(before);
    });

    test("invalid IDs return 400 and missing records/routes return 404", async () => {
      for (const method of ["GET", "PUT", "DELETE"]) {
        for (const id of ["invalid", "0", "01", "2147483648"]) {
          expect(
            (
              await request(
                `/${id}`,
                method === "PUT" ? jsonRequest(method, input) : { method },
              )
            ).status,
          ).toBe(400);
        }
        const response = await request(
          "/2147483647",
          method === "PUT" ? jsonRequest(method, input) : { method },
        );
        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ error: "Event not found" });
      }
      expect((await fetch(`${origin}/missing`)).status).toBe(404);
    });

    test("CORS allows configured frontend and denies an unrelated origin", async () => {
      const allowed = await request("", {
        method: "OPTIONS",
        headers: {
          Origin: "https://674259009-7153403-final-d.vercel.app",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      });
      expect(allowed.status).toBe(204);
      expect(allowed.headers.get("Access-Control-Allow-Origin")).toBe(
        "https://674259009-7153403-final-d.vercel.app",
      );
      const denied = await request("", {
        headers: { Origin: "https://unrelated.example" },
      });
      expect(denied.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });

    test("Swagger documents filters and DELETE 200", async () => {
      expect((await fetch(`${origin}/api/events/docs`)).status).toBe(200);
      const spec = (await (await fetch(`${origin}/api-docs.json`)).json()) as {
        paths: Record<
          string,
          {
            get: { parameters: { name: string }[] };
            delete: { responses: Record<string, unknown> };
          }
        >;
      };
      expect(
        spec.paths["/api/events"].get.parameters.map(
          (parameter: { name: string }) => parameter.name,
        ),
      ).toEqual(["search", "category"]);
      expect(
        spec.paths["/api/events/{id}"].delete.responses["200"],
      ).toBeDefined();
    });

    test("DELETE returns 200 and reseeding preserves edits/deletions", async () => {
      const response = await request(`/${createdId}`, { method: "DELETE" });
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        message: "Event deleted successfully",
      });
      expect((await request(`/${createdId}`)).status).toBe(404);
      const original = await Event.findOne();
      if (!original) throw new Error("No seeded event");
      const originalId = original.id;
      await original.destroy();
      expect(await seedEvents()).toBe(0);
      expect(await Event.findByPk(originalId)).toBeNull();
      expect(await Event.count()).toBe(11);
    });

    test("query failure returns sanitized 500 and recovers", async () => {
      await db.query(
        `ALTER TABLE "${schema}"."events" RENAME TO "events_unavailable"`,
      );
      try {
        const response = await request();
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({
          error: "Internal server error",
        });
      } finally {
        await db.query(
          `ALTER TABLE "${schema}"."events_unavailable" RENAME TO "events"`,
        );
      }
      expect((await request()).status).toBe(200);
    });
  },
);
