import { Router, Request, Response } from "express";
import { prisma } from "@/prisma";
import { getKeepAliveStatus, pingSelf } from "@/services/keep-alive-service";

export const healthRouter = Router();

healthRouter.get("/", async (req: Request, res: Response) => {
  const startTime = Date.now();
  let dbStatus = "unknown";
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    dbStatus = "connected";
  } catch (err: any) {
    dbStatus = "error";
  }

  const keepAlive = getKeepAliveStatus();

  res.status(dbStatus === "connected" ? 200 : 503).json({
    status: dbStatus === "connected" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatency,
    },
    keepAlive: {
      enabled: keepAlive.isInitialized,
      intervalMinutes: keepAlive.intervalMinutes,
      lastPingAt: keepAlive.lastPingAt,
      totalPings: keepAlive.totalPings,
      successfulPings: keepAlive.successfulPings,
    },
    responseTimeMs: Date.now() - startTime,
  });
});

healthRouter.post("/ping", async (req: Request, res: Response) => {
  const result = await pingSelf();
  res.json(result);
});
