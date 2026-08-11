import { NextResponse } from "next/server";
import { HrmsService } from "@/lib/services/hrms-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";

const UpdateLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await authorize(PERMISSIONS.HRMS_MANAGE);
    const { id } = await params;
    const body = await request.json();
    
    const validatedData = UpdateLeaveSchema.parse(body);
    const leave = await HrmsService.updateLeaveStatus(id, validatedData.status, userId);
    
    return NextResponse.json(leave);
  } catch (error: any) {
    return apiError(error, "Unable to update leave status");
  }
}
