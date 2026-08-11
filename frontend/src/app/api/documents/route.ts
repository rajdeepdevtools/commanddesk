import { NextResponse } from "next/server";
import { DocumentService } from "@/lib/services/document-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";
import { getUserSession } from "@/lib/auth/session";

const UploadDocumentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  folder: z.string().optional(),
  isPublic: z.boolean().optional(),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    await authorize(PERMISSIONS.DOCUMENTS_VIEW); // General permission
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const documents = await DocumentService.getDocuments(session.user.id, session.user.role);
    return NextResponse.json(documents);
  } catch (error) {
    return apiError(error, "Unable to load documents");
  }
}

export async function POST(request: Request) {
  try {
    await authorize(PERMISSIONS.DOCUMENTS_VIEW); // Employees can upload their own docs
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validatedData = UploadDocumentSchema.parse(body);
    
    const doc = await DocumentService.uploadDocument(session.user.id, validatedData);
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to upload document");
  }
}
