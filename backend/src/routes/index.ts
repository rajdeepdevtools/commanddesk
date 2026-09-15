import { Router } from "express";
import { healthRouter } from "./health.routes";
import { tasksRouter } from "./tasks.routes";
import { hrmsRouter } from "./hrms.routes";
import { employeesRouter } from "./employees.routes";
import { projectsRouter } from "./projects.routes";
import { crmRouter } from "./crm.routes";
import { financeRouter } from "./finance.routes";
import { supportRouter } from "./support.routes";
import { documentsRouter } from "./documents.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/tasks", tasksRouter);
apiRouter.use("/hrms", hrmsRouter);
apiRouter.use("/employees", employeesRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/crm", crmRouter);
apiRouter.use("/finance", financeRouter);
apiRouter.use("/support", supportRouter);
apiRouter.use("/documents", documentsRouter);
