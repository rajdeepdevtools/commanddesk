import { Router, Response } from "express";
import { AuthenticatedRequest } from "@/middleware/auth";
import { EmployeeService } from "@/services/employee-service";
import { DepartmentService } from "@/services/department-service";

export const employeesRouter = Router();

employeesRouter.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const employees = await EmployeeService.getAll(companyId);
    res.json(employees);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

employeesRouter.get("/stats", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const stats = await EmployeeService.getStats(companyId);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

employeesRouter.get("/departments", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string) || "default";
    const depts = await DepartmentService.getAll(companyId);
    res.json(depts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

employeesRouter.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId || req.body.companyId || "default";
    const employee = await EmployeeService.create({ ...req.body, companyId });
    res.status(201).json(employee);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
