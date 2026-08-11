import { NextResponse } from "next/server";
import { FinanceService } from "@/lib/services/finance-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";

const CreateInvoiceSchema = z.object({
  clientId: z.string().optional(),
  amount: z.union([z.number(), z.string()]),
  tax: z.union([z.number(), z.string()]).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.FINANCE_VIEW);
    const invoices = await FinanceService.getInvoices(companyId);
    return NextResponse.json(invoices);
  } catch (error) {
    return apiError(error, "Unable to load invoices");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.FINANCE_MANAGE);
    const body = await request.json();
    const validatedData = CreateInvoiceSchema.parse(body);
    
    const invoice = await FinanceService.createInvoice(companyId, validatedData);
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create invoice");
  }
}
