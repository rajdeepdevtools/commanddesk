import { NextResponse } from "next/server";
import { PayrollService } from "@/lib/services/payroll-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";

const RecordPaymentSchema = z.object({
  amount: z.union([z.number(), z.string()]),
  paymentDate: z.string().optional(),
  paymentMode: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await authorize(PERMISSIONS.PAYROLL_MANAGE);
    const body = await request.json();
    const validated = RecordPaymentSchema.parse(body);

    const result = await PayrollService.recordPayment(id, {
      amount: parseFloat(String(validated.amount)),
      paymentDate: validated.paymentDate,
      paymentMode: validated.paymentMode,
      reference: validated.reference,
      notes: validated.notes,
      createdById: access.userId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to record partial payment for payroll");
  }
}
