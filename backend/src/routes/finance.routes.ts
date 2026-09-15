import { Router, Response } from "express";
import { AuthenticatedRequest } from "@/middleware/auth";
import { FinanceService } from "@/services/finance-service";
import { InvoiceService } from "@/services/invoice-service";

export const financeRouter = Router();

financeRouter.get("/overview", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const data = await FinanceService.getDashboardStats(companyId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

financeRouter.get("/invoices", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const invoices = await InvoiceService.getAll(companyId);
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

financeRouter.post("/invoices", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.body.companyId || "default";
    const invoice = await InvoiceService.create({ ...req.body, companyId });
    res.status(201).json(invoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
