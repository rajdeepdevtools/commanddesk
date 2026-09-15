import { Router, Response } from "express";
import { AuthenticatedRequest } from "@/middleware/auth";
import { HrmsService } from "@/services/hrms-service";
import { AttendanceService } from "@/services/attendance-service";
import { LeaveService } from "@/services/leave-service";
import { PayrollService } from "@/services/payroll-service";

export const hrmsRouter = Router();

hrmsRouter.get("/dashboard", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const data = await HrmsService.getDashboardStats(companyId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

hrmsRouter.get("/attendance", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const data = await AttendanceService.getAll(companyId, date);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

hrmsRouter.post("/attendance/clock-in", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.body.userId;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const record = await AttendanceService.clockIn(userId, { location: req.body.location, ipAddress: req.body.ipAddress });
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

hrmsRouter.post("/attendance/clock-out", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.body.userId;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const record = await AttendanceService.clockOut(userId);
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

hrmsRouter.get("/leaves", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const data = await LeaveService.getAll(companyId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

hrmsRouter.post("/leaves", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.body.userId;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const leave = await LeaveService.create({
      userId,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      type: req.body.type,
      reason: req.body.reason,
    });
    res.status(201).json(leave);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

hrmsRouter.get("/payroll", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const data = await PayrollService.getPayrollHistory(companyId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
