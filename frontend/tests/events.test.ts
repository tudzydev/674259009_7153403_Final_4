import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { eventApi, ApiError } from "../src/lib/api";
import { validateEvent, isEvent } from "../src/lib/event-validation";
import { filterEvents, sortEventsByDate } from "../src/lib/event-utils";

const input = {
  title: "อบรม React",
  organizer: "IT Team",
  category: "อบรม" as const,
  eventDate: "2026-12-01",
  description: "รายละเอียด",
  status: true,
};
const event = { ...input, id: 1 };
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const respond = (body: unknown, status = 200) => {
  globalThis.fetch = (async () =>
    Response.json(body, { status })) as typeof fetch;
};

describe("event validation and filtering", () => {
  test("valid form trims text and preserves publication status", () => {
    assert.deepEqual(validateEvent({ ...input, title: "  อบรม React  " }), {
      success: true,
      data: input,
    });
  });
  test("invalid form returns field errors", () => {
    const result = validateEvent({
      ...input,
      title: " ",
      category: "wrong",
      eventDate: "2026-02-30",
      status: "true",
    });
    assert.equal(result.success, false);
    if (!result.success)
      for (const key of ["title", "category", "eventDate", "status"] as const)
        assert.ok(result.errors[key]);
  });
  test("rejects overlong text and year zero", () => {
    assert.equal(
      validateEvent({ ...input, description: "x".repeat(2001) }).success,
      false,
    );
    assert.equal(
      validateEvent({ ...input, eventDate: "0000-01-01" }).success,
      false,
    );
  });
  test("searches title and organizer without case sensitivity", () => {
    assert.equal(filterEvents([event], "react").length, 1);
    assert.equal(filterEvents([event], "IT TEAM").length, 1);
    assert.equal(filterEvents([event], "missing").length, 0);
  });
  test("sort does not mutate the original list", () => {
    const later = { ...event, id: 2, eventDate: "2026-12-02" };
    const events = [later, event];
    assert.deepEqual(
      sortEventsByDate(events).map((item) => item.id),
      [1, 2],
    );
    assert.deepEqual(
      events.map((item) => item.id),
      [2, 1],
    );
  });
  test("rejects malformed API event records", () => {
    assert.equal(isEvent(event), true);
    assert.equal(isEvent({ ...event, id: 0 }), false);
    assert.equal(isEvent({ ...event, createdAt: "invalid" }), false);
  });
});

describe("API client contract", () => {
  test("sends search/category and accepts valid records", async () => {
    let requested = "";
    globalThis.fetch = (async (path) => {
      requested = String(path);
      return Response.json({ data: [event] });
    }) as typeof fetch;
    assert.deepEqual(
      await eventApi.getAll({ search: " React ", category: "อบรม" }),
      [event],
    );
    const query = new URL(requested, "http://localhost").searchParams;
    assert.equal(query.get("search"), "React");
    assert.equal(query.get("category"), "อบรม");
  });
  test("reads backend error envelope with its HTTP status", async () => {
    respond({ error: "Invalid event input" }, 400);
    await assert.rejects(
      eventApi.create(input),
      (error) =>
        error instanceof ApiError &&
        error.status === 400 &&
        error.message === "Invalid event input",
    );
  });
  test("handles missing record and server errors", async () => {
    for (const status of [404, 500]) {
      respond(
        { error: status === 404 ? "Event not found" : "Internal server error" },
        status,
      );
      await assert.rejects(
        eventApi.getById(1),
        (error) => error instanceof ApiError && error.status === status,
      );
    }
  });
  test("handles network failures and malformed responses", async () => {
    globalThis.fetch = (async () => {
      throw new Error("offline");
    }) as typeof fetch;
    await assert.rejects(eventApi.getAll(), ApiError);
    respond({ data: [{ id: 1 }] });
    await assert.rejects(eventApi.getAll(), ApiError);
  });
  test("accepts DELETE 200 and legacy 204", async () => {
    respond({ message: "Event deleted successfully" });
    await eventApi.delete(1);
    globalThis.fetch = (async () =>
      new Response(null, { status: 204 })) as typeof fetch;
    await eventApi.delete(1);
  });
});
