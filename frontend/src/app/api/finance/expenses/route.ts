import { NextResponse } from "next/server";
import { FinanceService } from "@/lib/services/finance-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";

const CreateExpenseSchema = z.object({
  description: z.string().min(1),
  amount: z.union([z.number(), z.string()]),
  category: z.string().optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.FINANCE_VIEW);
    const expenses = await FinanceService.getExpenses(companyId);
    return NextResponse.json(expenses);
  } catch (error) {
    return apiError(error, "Unable to load expenses");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.FINANCE_MANAGE);
    const body = await request.json();
    const validatedData = CreateExpenseSchema.parse(body);
    
    const expense = await FinanceService.createExpense(companyId, validatedData);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to log expense");
  }
}
