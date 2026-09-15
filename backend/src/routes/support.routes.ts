import { Router, Response } from "express";
import { AuthenticatedRequest } from "@/middleware/auth";
import { SupportService } from "@/services/support-service";

export const supportRouter = Router();

supportRouter.get("/tickets", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const userId = req.user?.id || (req.query.userId as string) || "";
    const role = req.user?.role || (req.query.role as string) || "EMPLOYEE";
    const tickets = await SupportService.getTickets(companyId, userId, role);
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

supportRouter.post("/tickets", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.body.companyId || "default";
    const userId = req.user?.id || req.body.userId || "system";
    const ticket = await SupportService.createTicket(companyId, userId, req.body);
    res.status(201).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
