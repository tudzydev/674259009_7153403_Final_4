import { describe, expect, test } from "bun:test";
import { getDatabaseSettings } from "../src/config/database-setting";

const local = { DATABASE_URL: "postgres://test:test@127.0.0.1:5433/event_db" };
describe("database configuration", () => {
  test("defaults to local PostgreSQL with bounded timeout", () => {
    const settings = getDatabaseSettings(local);
    expect(settings.provider).toBe("local");
    expect(settings.options.dialect).toBe("postgres");
    expect(settings.options.pool?.acquire).toBe(10000);
  });
  test("requires an explicit valid PostgreSQL URL", () => {
    for (const DATABASE_URL of [undefined, "bad", "https://example.com"]) {
      expect(() => getDatabaseSettings({ DATABASE_URL })).toThrow();
    }
  });
  test("rejects unsupported providers", () => {
    expect(() =>
      getDatabaseSettings({ ...local, DATABASE_PROVIDER: "sqlite" }),
    ).toThrow();
  });
  test("rejects invalid timeouts", () => {
    for (const timeout of ["0", "60001", "abc", "1.5"]) {
      expect(() =>
        getDatabaseSettings({ ...local, DATABASE_CONNECT_TIMEOUT_MS: timeout }),
      ).toThrow();
    }
  });
  test("requires Neon mode for Neon hosts", () => {
    expect(() =>
      getDatabaseSettings({
        DATABASE_URL: "postgres://test:test@test.neon.tech/db",
      }),
    ).toThrow();
  });
  test("Neon uses its driver and strips conflicting URL TLS options", () => {
    const settings = getDatabaseSettings({
      DATABASE_PROVIDER: "neon",
      DATABASE_URL: "postgres://test:test@test.neon.tech/db?sslmode=require",
    });
    expect(settings.options.dialectModule).toBeDefined();
    expect(settings.url).not.toContain("sslmode");
  });
  test("rejects legacy Neon CA setting", () => {
    expect(() =>
      getDatabaseSettings({
        ...local,
        DATABASE_PROVIDER: "neon",
        DATABASE_SSL_CA_FILE: "old.pem",
      }),
    ).toThrow();
  });
});
