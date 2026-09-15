import { Router, Response } from "express";
import { AuthenticatedRequest } from "@/middleware/auth";
import { DocumentService } from "@/services/document-service";

export const documentsRouter = Router();

documentsRouter.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || (req.query.userId as string);
    const role = req.user?.role || (req.query.role as string) || "EMPLOYEE";
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const docs = await DocumentService.getDocuments(userId, role);
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

documentsRouter.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uploaderId = req.user?.id || req.body.uploaderId;
    if (!uploaderId) return res.status(400).json({ error: "uploaderId is required" });
    const doc = await DocumentService.uploadDocument(uploaderId, req.body);
    res.status(201).json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
