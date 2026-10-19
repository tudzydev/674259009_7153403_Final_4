import type { Options } from "sequelize";
import { neonDialect } from "./neon-driver";

export type DatabaseProvider = "local" | "neon";

export function getDatabaseSettings(env: NodeJS.ProcessEnv = process.env) {
  const provider = env.DATABASE_PROVIDER ?? "local";
  if (provider !== "local" && provider !== "neon") {
    throw new Error("DATABASE_PROVIDER must be local or neon");
  }
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not defined");

  let url: URL;
  try {
    url = new URL(env.DATABASE_URL);
    if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname) {
      throw new Error();
    }
  } catch {
    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL connection string",
    );
  }
  if (provider === "local" && url.hostname.endsWith(".neon.tech")) {
    throw new Error(
      "A Neon URL requires DATABASE_PROVIDER=neon and verified TLS over WebSockets",
    );
  }

  const timeout = Number(env.DATABASE_CONNECT_TIMEOUT_MS ?? "10000");
  if (!Number.isInteger(timeout) || timeout < 1 || timeout > 60000) {
    throw new Error("DATABASE_CONNECT_TIMEOUT_MS must be between 1 and 60000");
  }

  // pg URL options must not replace the explicit TLS policy for either mode.
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) {
    url.searchParams.delete(key);
  }

  if (provider === "neon" && env.DATABASE_SSL_CA_FILE) {
    throw new Error(
      "Neon now uses secure WebSockets. Replace DATABASE_SSL_CA_FILE with NODE_EXTRA_CA_CERTS set before starting Bun.",
    );
  }

  const options = {
    dialect: "postgres",
    ...(provider === "neon" ? { dialectModule: neonDialect } : {}),
    logging: false,
    dialectOptions: {
      // Neon encrypts via wss:// on port 443; local PostgreSQL uses plain TCP.
      ssl: false,
      connectionTimeoutMillis: timeout,
    },
    // Do not repeat blocked connections automatically during startup.
    retry: { max: 0 },
    pool: { max: 5, min: 0, acquire: timeout, idle: 10000 },
  } satisfies Options;
  return { provider, url: url.toString(), options } satisfies {
    provider: DatabaseProvider;
    url: string;
    options: Options;
  };
}
