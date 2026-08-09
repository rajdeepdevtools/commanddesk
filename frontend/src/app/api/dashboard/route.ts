import { NextResponse } from "next/server";
import { DashboardService } from "@/lib/services/dashboard-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET() {
  try {
    const { companyId } = await authorize(PERMISSIONS.DASHBOARD_VIEW);
    const overview = await DashboardService.getOverview(companyId);
    return NextResponse.json(overview);
  } catch (error) {
    return apiError(error, "Unable to load dashboard overview");
  }
}
