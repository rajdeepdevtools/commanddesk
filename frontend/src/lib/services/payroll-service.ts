import { prisma } from "@/lib/prisma";
import { EmailService } from "../email/email-service";
import { getPayslipTemplate } from "../email/templates";

export interface RecordPayrollPaymentInput {
  amount: number;
  paymentDate?: Date | string;
  paymentMode?: string;
  reference?: string;
  notes?: string;
  createdById?: string;
}

export class PayrollService {
  static async getPayrollHistory(companyId: string) {
    const rawPayrolls = await prisma.payroll.findMany({
      where: { user: { companyId } },
      include: {
        user: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            email: true,
            employeeProfile: {
              select: { designation: true, bankAccount: true, panNumber: true }
            },
            company: {
              select: { name: true, logoUrl: true, address: true, gst: true }
            }
          } 
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return rawPayrolls.map((payroll) => {
      const totalPaid = (payroll.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      // Fallback if status is PAID but no explicit PayrollPayment record exists yet
      const effectivePaid = totalPaid > 0 ? totalPaid : (payroll.status === "PAID" ? payroll.netSalary : 0);
      const remainingBalance = Math.max(0, payroll.netSalary - effectivePaid);

      let status = payroll.status;
      if (effectivePaid >= payroll.netSalary) {
        status = "PAID";
      } else if (effectivePaid > 0) {
        status = "PARTIALLY_PAID";
      } else {
        status = "PENDING";
      }

      return {
        ...payroll,
        status,
        totalPaid: effectivePaid,
        remainingBalance,
      };
    });
  }

  static async generatePayroll(userId: string, data: any) {
    const basicSalary = parseFloat(data.basicSalary);
    const hra = data.hra ? parseFloat(data.hra) : 0;
    const da = data.da ? parseFloat(data.da) : 0;
    const bonus = data.bonus ? parseFloat(data.bonus) : 0;
    
    const tax = data.tax ? parseFloat(data.tax) : 0;
    const pf = data.pf ? parseFloat(data.pf) : 0;
    const esi = data.esi ? parseFloat(data.esi) : 0;
    const otherDeductions = data.deductions ? parseFloat(data.deductions) : 0;

    const totalEarnings = basicSalary + hra + da + bonus;
    const totalDeductions = tax + pf + esi + otherDeductions;
    const netSalary = totalEarnings - totalDeductions;

    const initialStatus = data.status || "PENDING";
    const initialPaymentAmount = initialStatus === "PAID" ? netSalary : (data.initialPaidAmount ? parseFloat(data.initialPaidAmount) : 0);

    const payroll = await prisma.payroll.create({
      data: {
        userId,
        month: parseInt(data.month),
        year: parseInt(data.year),
        basicSalary,
        hra,
        da,
        bonus,
        tax,
        pf,
        esi,
        deductions: otherDeductions,
        netSalary,
        status: initialPaymentAmount >= netSalary ? "PAID" : (initialPaymentAmount > 0 ? "PARTIALLY_PAID" : "PENDING"),
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : (initialPaymentAmount > 0 ? new Date() : null),
        paymentMode: data.paymentMode || "BANK_TRANSFER",
        remarks: data.remarks,
        ...(initialPaymentAmount > 0
          ? {
              payments: {
                create: {
                  amount: initialPaymentAmount,
                  paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
                  paymentMode: data.paymentMode || "BANK_TRANSFER",
                  reference: data.remarks || "Initial Payment",
                },
              },
            }
          : {}),
      },
      include: { user: { select: { email: true, firstName: true } }, payments: true },
    });

    if (payroll.user?.email) {
      EmailService.sendMail({
        to: payroll.user.email,
        subject: `Your Payslip for ${payroll.month}/${payroll.year} is Ready 💰`,
        html: getPayslipTemplate(payroll.user.firstName, payroll.month, payroll.year, payroll.netSalary),
      }).catch(console.error);
    }

    return payroll;
  }

  static async recordPayment(payrollId: string, input: RecordPayrollPaymentInput) {
    if (!input.amount || input.amount <= 0) {
      throw new Error("Payment amount must be greater than zero.");
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: { payments: true },
    });

    if (!payroll) {
      throw new Error("Payroll record not found.");
    }

    const paymentDate = input.paymentDate ? new Date(input.paymentDate) : new Date();

    const payment = await prisma.payrollPayment.create({
      data: {
        payrollId,
        amount: input.amount,
        paymentDate,
        paymentMode: input.paymentMode || "BANK_TRANSFER",
        reference: input.reference,
        notes: input.notes,
        createdById: input.createdById,
      },
    });

    const updatedPayments = await prisma.payrollPayment.findMany({ where: { payrollId } });
    const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);

    let newStatus = "PENDING";
    if (totalPaid >= payroll.netSalary) {
      newStatus = "PAID";
    } else if (totalPaid > 0) {
      newStatus = "PARTIALLY_PAID";
    }

    await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        status: newStatus,
        paymentDate: paymentDate,
        paymentMode: input.paymentMode || payroll.paymentMode,
      },
    });

    return {
      payment,
      totalPaid,
      remainingBalance: Math.max(0, payroll.netSalary - totalPaid),
      status: newStatus,
    };
  }
}
