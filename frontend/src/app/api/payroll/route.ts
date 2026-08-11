import { NextResponse } from "next/server";
import { PayrollService } from "@/lib/services/payroll-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";

const CreatePayrollSchema = z.object({
  userId: z.string().min(1),
  month: z.union([z.number(), z.string()]),
  year: z.union([z.number(), z.string()]),
  basicSalary: z.union([z.number(), z.string()]),
  hra: z.union([z.number(), z.string()]).optional(),
  da: z.union([z.number(), z.string()]).optional(),
  bonus: z.union([z.number(), z.string()]).optional(),
  tax: z.union([z.number(), z.string()]).optional(),
  pf: z.union([z.number(), z.string()]).optional(),
  esi: z.union([z.number(), z.string()]).optional(),
  deductions: z.union([z.number(), z.string()]).optional(),
});

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.PAYROLL_VIEW);
    const payrolls = await PayrollService.getPayrollHistory(companyId);
    return NextResponse.json(payrolls);
  } catch (error) {
    return apiError(error, "Unable to load payroll history");
  }
}

export async function POST(request: Request) {
  try {
    await authorize(PERMISSIONS.PAYROLL_MANAGE);
    const body = await request.json();
    const validatedData = CreatePayrollSchema.parse(body);
    
    const payroll = await PayrollService.generatePayroll(validatedData.userId, validatedData);
    return NextResponse.json(payroll, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to generate payroll");
  }
}
