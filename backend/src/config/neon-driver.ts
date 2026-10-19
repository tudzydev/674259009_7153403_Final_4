import * as neon from "@neondatabase/serverless";

// Bun supplies WebSocket. TLS is verified by the secure WebSocket transport;
// a second PostgreSQL TLS session inside that tunnel is unnecessary.
neon.neonConfig.webSocketConstructor = WebSocket;
neon.neonConfig.useSecureWebSocket = true;
neon.neonConfig.forceDisablePgSSL = true;

export const neonDialect = neon;
