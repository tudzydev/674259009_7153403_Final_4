import { describe, expect, test } from "bun:test";
import { getDatabaseSettings } from "../src/config/database-setting";
import { describeDatabaseError } from "../src/config/database-errors";

const localUrl = "postgres://postgres:postgres@localhost:5433/event_db";

describe("database configuration", () => {
  test("local configuration matches the Docker port and database", () => {
    const settings = getDatabaseSettings({ DATABASE_URL: localUrl });
    expect(settings.provider).toBe("local");
    expect(settings.options.dialect).toBe("postgres");
    expect(settings.options.dialectOptions.ssl).toBe(false);
    expect(settings.options.pool?.acquire).toBe(10000);
    expect(settings.options.dialectModule).toBeUndefined();
    const url = new URL(settings.url);
    expect(url.port).toBe("5433");
    expect(url.pathname).toBe("/event_db");
  });

  test("Neon uses its WebSocket driver and explicit timeout", () => {
    const settings = getDatabaseSettings({
      DATABASE_PROVIDER: "neon",
      DATABASE_URL: "postgres://user:password@example.neon.tech/event_db?sslmode=require",
      DATABASE_CONNECT_TIMEOUT_MS: "1500",
    });
    expect(settings.options.dialectModule).toBeDefined();
    expect(settings.options.dialectOptions.connectionTimeoutMillis).toBe(1500);
    expect(settings.options.pool?.acquire).toBe(1500);
    expect(new URL(settings.url).searchParams.has("sslmode")).toBe(false);
  });

  test("rejects missing URLs, invalid providers, protocols, and timeouts", () => {
    for (const env of [
      {},
      { DATABASE_URL: "bad" },
      { DATABASE_URL: "https://localhost/db" },
      { DATABASE_URL: localUrl, DATABASE_PROVIDER: "unknown" },
      { DATABASE_URL: "postgres://user:pass@example.neon.tech/db" },
      ...["0", "60001", "abc", "1.5"].map((timeout) => ({
        DATABASE_URL: localUrl,
        DATABASE_CONNECT_TIMEOUT_MS: timeout,
      })),
    ]) {
      expect(() => getDatabaseSettings(env)).toThrow();
    }
  });

  test("connection errors provide guidance without exposing credentials", () => {
    const message = describeDatabaseError({
      original: { code: "28P01", message: localUrl },
    }, "local");
    expect(message).toContain("authentication failed");
    expect(message).not.toContain(localUrl);
    expect(describeDatabaseError({ parent: { code: "ECONNREFUSED" } }, "local")).toContain("5433");
  });
});
