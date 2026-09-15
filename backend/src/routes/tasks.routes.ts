import { Router, Response } from "express";
import { AuthenticatedRequest } from "@/middleware/auth";
import { TaskService } from "@/services/task-service";

export const tasksRouter = Router();

tasksRouter.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || (req.query.userId as string);
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const tasks = await TaskService.getTasksByUser(userId);
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

tasksRouter.get("/stats", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const stats = await TaskService.getStats(companyId, req.user?.id);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

tasksRouter.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const createdById = req.user?.id || "system";
    const task = await TaskService.createTask(req.body, createdById);
    res.status(201).json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

tasksRouter.patch("/:id/status", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await TaskService.updateTaskStatus(id, status);
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
