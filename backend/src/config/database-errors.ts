import type { DatabaseProvider } from "./database-setting";

/** Summarize driver errors without logging URLs, credentials or raw messages. */
export function describeDatabaseError(
  error: unknown,
  provider: DatabaseProvider,
): string {
  const codes = new Set<string>();
  const messages: string[] = [];
  const visited = new Set<unknown>();
  function collect(value: unknown) {
    if (!value || typeof value !== "object" || visited.has(value)) return;
    visited.add(value);
    const item = value as Record<string, unknown>;
    if (typeof item.code === "string") codes.add(item.code);
    if (typeof item.message === "string")
      messages.push(item.message.toLowerCase());
    collect(item.original);
    collect(item.parent);
    collect(item.cause);
    if (Array.isArray(item.errors)) item.errors.forEach(collect);
  }
  collect(error);
  const has = (...values: string[]) => values.some((code) => codes.has(code));
  const text = messages.join(" ");
  const localHelp =
    provider === "neon"
      ? " If your university network blocks Neon, use Docker PostgreSQL: run 'docker compose up -d postgres' from the project root, then 'bun run dev:local' in backend."
      : " Start Docker PostgreSQL with 'docker compose up -d postgres' and check localhost:5433.";

  if (has("28P01", "28000")) {
    return "Database authentication failed. Check credentials in the selected environment file.";
  }
  if (has("3D000")) {
    return "The selected database does not exist. Check the database name in DATABASE_URL.";
  }
  if (has("ENOTFOUND", "EAI_AGAIN")) {
    return (
      "Database DNS lookup failed. Check the hostname, DNS and network access." +
      localHelp
    );
  }
  if (
    has(
      "SELF_SIGNED_CERT_IN_CHAIN",
      "DEPTH_ZERO_SELF_SIGNED_CERT",
      "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
      "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
      "CERT_HAS_EXPIRED",
      "CERT_NOT_YET_VALID",
      "ERR_TLS_CERT_ALTNAME_INVALID",
    ) ||
    /certificate|\bssl\b|\btls\b/.test(text)
  ) {
    return (
      "Database TLS/certificate verification failed. Check the hostname and system clock. If your university uses TLS inspection, request its trusted CA from IT and set NODE_EXTRA_CA_CERTS before starting Bun. Certificate verification remains enabled." +
      localHelp
    );
  }
  if (has("ETIMEDOUT", "ESOCKETTIMEDOUT") || /timeout|timed out/.test(text)) {
    return (
      (provider === "neon"
        ? "Database connection timed out. Check access to the Neon endpoint over secure WebSockets on port 443."
        : "Database connection timed out. Check access to local PostgreSQL on port 5433.") +
      localHelp
    );
  }
  if (
    has(
      "ECONNREFUSED",
      "ECONNRESET",
      "ENETUNREACH",
      "EHOSTUNREACH",
      "EACCES",
      "EPERM",
    )
  ) {
    return (
      "Database network connection failed. Check the server, port and firewall rules." +
      localHelp
    );
  }
  return (
    "Database connection failed. Check the selected environment file, network access and database status." +
    localHelp
  );
}
