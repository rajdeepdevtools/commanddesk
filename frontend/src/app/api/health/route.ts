import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getKeepAliveStatus } from "@/lib/services/keep-alive-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Health check endpoint.
 * Responds to ping requests from external monitors and the internal keep-alive service
 * to prevent the server from sleeping or going idle on cloud platforms.
 */
export async function GET() {
  const startTime = Date.now();
  let dbStatus: "healthy" | "unhealthy" | "disabled" = "healthy";
  let dbLatencyMs: number | null = null;
  let dbError: string | null = null;

  try {
    const dbStart = Date.now();
    // Quick query probe with a 3-second timeout to check database connectivity
    await Promise.race([
      prisma.$queryRawUnsafe("SELECT 1"),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database ping timed out after 3000ms")), 3000)
      ),
    ]);
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    dbStatus = "unhealthy";
    dbError = err instanceof Error ? err.message : String(err);
  }

  const memoryUsage = process.memoryUsage ? process.memoryUsage() : null;
  const keepAlive = getKeepAliveStatus();
  const isHealthy = dbStatus === "healthy";

  const payload = {
    status: isHealthy ? "ok" : "degraded",
    message: isHealthy ? "Server is healthy and active" : "Server active (database connection degraded)",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    responseTimeMs: Date.now() - startTime,
    services: {
      server: "healthy",
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        ...(dbError ? { error: dbError } : {}),
      },
    },
    keepAlive: {
      enabled: process.env.ENABLE_KEEP_ALIVE !== "false",
      intervalMinutes: keepAlive.intervalMinutes,
      selfUrl: keepAlive.selfUrl,
      lastPingAt: keepAlive.lastPingAt,
      lastSuccess: keepAlive.lastSuccess,
      totalPings: keepAlive.totalPings,
      successfulPings: keepAlive.successfulPings,
    },
    ...(memoryUsage
      ? {
          memory: {
            rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
            heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          },
        }
      : {}),
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "X-Health-Check": "true",
    },
  });
}

/**
 * Lightweight HEAD endpoint for low-overhead pinging.
 */
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Health-Check": "true",
    },
  });
}
