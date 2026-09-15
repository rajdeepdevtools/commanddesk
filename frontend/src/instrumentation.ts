/**
 * Next.js Instrumentation
 *
 * Runs once when the Next.js server instance is initiated.
 * Initializes background services like the keep-alive anti-sleep pinger.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initKeepAlive } = await import("@/lib/services/keep-alive-service");
    initKeepAlive();
  }
}
