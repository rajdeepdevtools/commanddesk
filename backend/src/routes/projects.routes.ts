import { Router, Response } from "express";
import { AuthenticatedRequest } from "@/middleware/auth";
import { ProjectService } from "@/services/project-service";

export const projectsRouter = Router();

projectsRouter.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const projects = await ProjectService.getAll(companyId);
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

projectsRouter.get("/stats", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const stats = await ProjectService.getStats(companyId);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

projectsRouter.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const project = await ProjectService.getById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

projectsRouter.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.body.companyId || "default";
    const project = await ProjectService.create({ ...req.body, companyId });
    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
