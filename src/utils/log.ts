export function log(...args: unknown[]): void {
  // Only log to stderr in development or when explicitly enabled
  if (process.env.NODE_ENV !== "production" || process.env.GTM_MCP_DEBUG === "true") {
    console.error(`[${new Date().toISOString()}] [GTM-MCP]`, ...args);
  }
}