import { NextResponse } from "next/server";
import { CrmService } from "@/lib/services/crm-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";

const CreateLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.string().optional(),
  budget: z.union([z.number(), z.string()]).optional(),
  score: z.union([z.number(), z.string()]).optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_VIEW);
    const leads = await CrmService.getLeads(companyId);
    return NextResponse.json(leads);
  } catch (error) {
    return apiError(error, "Unable to load leads");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.CRM_MANAGE);
    const body = await request.json();
    const validatedData = CreateLeadSchema.parse(body);
    
    const lead = await CrmService.createLead(companyId, validatedData);
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create lead");
  }
}
