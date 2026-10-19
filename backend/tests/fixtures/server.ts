// Test-only entry point. Set schema defaults before loading application models.
if (
  process.env.RUN_DB_TESTS !== "1" ||
  !/^exam_test_[a-f0-9]{32}$/.test(process.env.TEST_SCHEMA ?? "")
) {
  throw new Error("A generated integration-test schema is required");
}
if (
  !["localhost", "127.0.0.1", "[::1]"].includes(
    new URL(process.env.DATABASE_URL!).hostname,
  )
) {
  throw new Error("Test server requires local PostgreSQL");
}
const { sequelize } = await import("../../src/config/database");
const options = (
  sequelize as typeof sequelize & { options: { define: { schema?: string } } }
).options;
options.define = { ...options.define, schema: process.env.TEST_SCHEMA };
await import("../../src/server");
export {};
