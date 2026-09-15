/**
 * Self-Ping Keep-Alive Service
 *
 * Prevents the application and server from sleeping/going inactive on free-tier hosting
 * platforms (like Render, Railway, Glitch, etc.) by automatically sending periodic
 * lightweight health checks to the server's own health endpoint.
 */

interface KeepAliveState {
  isInitialized: boolean;
  timer: NodeJS.Timeout | null;
  selfUrl: string | null;
  intervalMinutes: number;
  lastPingAt: string | null;
  lastStatus: number | null;
  lastSuccess: boolean | null;
  lastError: string | null;
  totalPings: number;
  successfulPings: number;
}

const globalForKeepAlive = globalThis as unknown as {
  __keepAliveState?: KeepAliveState;
};

const state: KeepAliveState = globalForKeepAlive.__keepAliveState ?? {
  isInitialized: false,
  timer: null,
  selfUrl: null,
  intervalMinutes: 10,
  lastPingAt: null,
  lastStatus: null,
  lastSuccess: null,
  lastError: null,
  totalPings: 0,
  successfulPings: 0,
};

globalForKeepAlive.__keepAliveState = state;

/**
 * Resolves the application's self URL from environment variables or platform defaults.
 */
export function getSelfUrl(): string {
  if (process.env.SELF_URL) {
    return process.env.SELF_URL.replace(/\/+$/, "");
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, "");
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    const renderUrl = process.env.RENDER_EXTERNAL_URL.startsWith("http")
      ? process.env.RENDER_EXTERNAL_URL
      : `https://${process.env.RENDER_EXTERNAL_URL}`;
    return renderUrl.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
    return vercelUrl.replace(/\/+$/, "");
  }

  const port = process.env.PORT || "3000";
  return `http://localhost:${port}`;
}

/**
 * Sends a single ping request to the health endpoint.
 */
export async function pingSelf(): Promise<{ success: boolean; status?: number; error?: string }> {
  const baseUrl = getSelfUrl();
  const healthEndpoint = `${baseUrl}/api/health?keepalive=true`;
  const timestamp = new Date().toISOString();

  state.lastPingAt = timestamp;
  state.totalPings += 1;
  state.selfUrl = baseUrl;

  try {
    const response = await fetch(healthEndpoint, {
      method: "GET",
      headers: {
        "User-Agent": "CommandDesk-KeepAlive/1.0",
        "X-Keep-Alive-Ping": "true",
      },
      cache: "no-store",
    });

    state.lastStatus = response.status;
    state.lastSuccess = response.ok;
    state.lastError = response.ok ? null : `HTTP ${response.status} ${response.statusText}`;

    if (response.ok) {
      state.successfulPings += 1;
      console.log(`[KeepAlive] Ping successful (${response.status}) at ${timestamp} -> ${healthEndpoint}`);
      return { success: true, status: response.status };
    } else {
      console.warn(`[KeepAlive] Ping received non-200 status (${response.status}) at ${timestamp}`);
      return { success: false, status: response.status, error: state.lastError || undefined };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    state.lastSuccess = false;
    state.lastError = errorMessage;
    console.error(`[KeepAlive] Ping failed at ${timestamp} (${healthEndpoint}):`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Initializes the keep-alive background ping cycle.
 * Should only be called on server startup (e.g., in instrumentation.ts).
 */
export function initKeepAlive(): void {
  // Prevent duplicate intervals across HMR or multiple imports
  if (state.isInitialized && state.timer) {
    return;
  }

  // Only enable automatic self-pinging in production or when explicitly configured on a deployed host
  const isProduction = process.env.NODE_ENV === "production";
  const isExplicitlyEnabled = process.env.ENABLE_KEEP_ALIVE === "true";
  const isExplicitlyDisabled = process.env.ENABLE_KEEP_ALIVE === "false";

  if (isExplicitlyDisabled || (!isProduction && !isExplicitlyEnabled)) {
    console.log("[KeepAlive] Self-ping background service is idle in local development mode.");
    return;
  }

  const parsedMinutes = parseInt(process.env.KEEP_ALIVE_INTERVAL_MINUTES || "10", 10);
  const intervalMinutes = isNaN(parsedMinutes) || parsedMinutes < 1 ? 10 : parsedMinutes;
  const intervalMs = intervalMinutes * 60 * 1000;

  state.isInitialized = true;
  state.intervalMinutes = intervalMinutes;
  state.selfUrl = getSelfUrl();

  // If running locally with default localhost, do not self-ping to prevent port conflicts
  if (state.selfUrl.includes("localhost") || state.selfUrl.includes("127.0.0.1")) {
    console.log("[KeepAlive] Localhost target detected; keeping service idle to avoid dev server contention.");
    return;
  }

  console.log(
    `[KeepAlive] Initialized self-ping service for ${state.selfUrl} every ${intervalMinutes} minute(s)`
  );

  // Initial ping 15 seconds after server start to ensure routes and DB are warm
  const startupTimeout = setTimeout(() => {
    pingSelf().catch((err) => {
      console.error("[KeepAlive] Initial startup ping error:", err);
    });
  }, 15_000);

  if (typeof startupTimeout.unref === "function") {
    startupTimeout.unref();
  }

  // Periodic ping interval
  const timer = setInterval(() => {
    pingSelf().catch((err) => {
      console.error("[KeepAlive] Interval ping error:", err);
    });
  }, intervalMs);

  if (typeof timer.unref === "function") {
    timer.unref();
  }

  state.timer = timer;
}

/**
 * Stops the keep-alive service.
 */
export function stopKeepAlive(): void {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  state.isInitialized = false;
  console.log("[KeepAlive] Service stopped");
}

/**
 * Returns current telemetry and status for the keep-alive service.
 */
export function getKeepAliveStatus() {
  return {
    isInitialized: state.isInitialized,
    selfUrl: state.selfUrl || getSelfUrl(),
    intervalMinutes: state.intervalMinutes,
    lastPingAt: state.lastPingAt,
    lastStatus: state.lastStatus,
    lastSuccess: state.lastSuccess,
    lastError: state.lastError,
    totalPings: state.totalPings,
    successfulPings: state.successfulPings,
  };
}
