import { NextResponse } from "next/server";
import { HrmsService } from "@/lib/services/hrms-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.HR_VIEW);
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    
    const attendance = await HrmsService.getAttendance(companyId, startDate, endDate);
    return NextResponse.json(attendance);
  } catch (error) {
    return apiError(error, "Unable to load attendance");
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await authorize();
    
    const attendance = await HrmsService.clockIn(user.id);
    return NextResponse.json(attendance, { status: 201 });
  } catch (error: any) {
    return apiError(error, error.message || "Unable to clock in");
  }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await authorize();
    
    const attendance = await HrmsService.clockOut(user.id);
    return NextResponse.json(attendance);
  } catch (error: any) {
    return apiError(error, error.message || "Unable to clock out");
  }
}
