import { NextResponse } from "next/server";
import { CrmService } from "@/lib/services/crm-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";

const UpdateLeadStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_MANAGE);
    const { id } = await params;
    const body = await request.json();
    
    // Check if we are doing a client conversion
    if (body.action === "CONVERT_TO_CLIENT") {
      const client = await CrmService.convertLeadToClient(companyId, id);
      return NextResponse.json(client);
    }

    const validatedData = UpdateLeadStatusSchema.parse(body);
    const lead = await CrmService.updateLeadStatus(companyId, id, validatedData.status);
    
    return NextResponse.json(lead);
  } catch (error) {
    return apiError(error, "Unable to update lead");
  }
}
