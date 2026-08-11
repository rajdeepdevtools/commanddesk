import { NextResponse } from "next/server";
import { CrmService } from "@/lib/services/crm-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.SALES_VIEW);
    const clients = await CrmService.getClients(companyId);
    return NextResponse.json(clients);
  } catch (error) {
    return apiError(error, "Unable to load clients");
  }
}
