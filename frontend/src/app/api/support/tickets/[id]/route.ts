import { NextResponse } from "next/server";
import { SupportService } from "@/lib/services/support-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";

const UpdateTicketSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only support staff / admins should update status and assignments
    const { companyId } = await authorize(PERMISSIONS.SUPPORT_MANAGE);
    const resolvedParams = await params;
    
    const body = await request.json();
    const validatedData = UpdateTicketSchema.parse(body);
    
    const ticket = await SupportService.updateTicket(companyId, resolvedParams.id, validatedData);
    return NextResponse.json(ticket);
  } catch (error) {
    return apiError(error, "Unable to update ticket");
  }
}
