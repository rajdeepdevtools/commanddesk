import { Router, Response } from "express";
import { AuthenticatedRequest } from "@/middleware/auth";
import { CrmService } from "@/services/crm-service";
import { LeadService } from "@/services/lead-service";
import { ClientService } from "@/services/client-service";

export const crmRouter = Router();

crmRouter.get("/overview", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const [leads, clients] = await Promise.all([
      CrmService.getLeads(companyId),
      CrmService.getClients(companyId),
    ]);
    res.json({ leads, clients });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

crmRouter.get("/leads", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const leads = await LeadService.getAll(companyId);
    res.json(leads);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

crmRouter.post("/leads", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.body.companyId || "default";
    const lead = await LeadService.create({ ...req.body, companyId });
    res.status(201).json(lead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

crmRouter.get("/clients", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const clients = await ClientService.getAll(companyId);
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

crmRouter.post("/clients", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.body.companyId || "default";
    const client = await ClientService.create({ ...req.body, companyId });
    res.status(201).json(client);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
