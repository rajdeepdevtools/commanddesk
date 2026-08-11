import { NextResponse } from "next/server";
import { DocumentService } from "@/lib/services/document-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { getUserSession } from "@/lib/auth/session";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authorize(PERMISSIONS.DOCUMENTS_VIEW); // Base permission
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const resolvedParams = await params;
    
    await DocumentService.deleteDocument(session.user.id, session.user.role, resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, "Unable to delete document");
  }
}
