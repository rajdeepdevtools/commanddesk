import { NextResponse } from "next/server";
import { FinanceService } from "@/lib/services/finance-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.FINANCE_VIEW);
    const stats = await FinanceService.getDashboardStats(companyId);
    return NextResponse.json(stats);
  } catch (error) {
    return apiError(error, "Unable to load finance stats");
  }
}
