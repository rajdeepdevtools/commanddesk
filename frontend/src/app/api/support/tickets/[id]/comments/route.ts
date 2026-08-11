import { NextResponse } from "next/server";
import { SupportService } from "@/lib/services/support-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";
import { getUserSession } from "@/lib/auth/session";

const CreateCommentSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authorize(PERMISSIONS.SUPPORT_VIEW);
    const resolvedParams = await params;
    const comments = await SupportService.getComments(resolvedParams.id);
    return NextResponse.json(comments);
  } catch (error) {
    return apiError(error, "Unable to load comments");
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authorize(PERMISSIONS.SUPPORT_VIEW);
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolvedParams = await params;
    const body = await request.json();
    const validatedData = CreateCommentSchema.parse(body);
    
    const comment = await SupportService.addComment(resolvedParams.id, session.user.id, validatedData);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to add comment");
  }
}
