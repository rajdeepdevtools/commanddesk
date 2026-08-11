import { NextResponse } from "next/server";
import { HrmsService } from "@/lib/services/hrms-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";

const CreateLeaveSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  type: z.string(),
  reason: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.HRMS_VIEW);
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    
    const leaves = await HrmsService.getLeaves(companyId, startDate, endDate);
    return NextResponse.json(leaves);
  } catch (error) {
    return apiError(error, "Unable to load leaves");
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await authorize(PERMISSIONS.HRMS_VIEW);
    const body = await request.json();
    
    const validatedData = CreateLeaveSchema.parse(body);
    const leave = await HrmsService.createLeaveRequest(userId, validatedData);
    
    return NextResponse.json(leave, { status: 201 });
  } catch (error: any) {
    return apiError(error, "Unable to request leave");
  }
}
