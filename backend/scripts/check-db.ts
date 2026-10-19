// Read-only connectivity check; does not sync or modify tables.
let close: (() => Promise<void>) | undefined;
try {
  const { connectDB, sequelize } = await import("../src/config/database");
  close = () => sequelize.close();
  await connectDB();
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Database check failed",
  );
  process.exitCode = 1;
} finally {
  await close?.();
}

export {};
