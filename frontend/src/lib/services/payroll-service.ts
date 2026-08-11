import { prisma } from "@/lib/prisma";
import { EmailService } from "../email/email-service";
import { getPayslipTemplate } from "../email/templates";

export class PayrollService {
  static async getPayrollHistory(companyId: string) {
    return prisma.payroll.findMany({
      where: { user: { companyId } }, // Ensure users belong to the company
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
      },
      orderBy: { createdAt: "desc" },
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
        status: data.status || "PAID",
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        paymentMode: data.paymentMode || "BANK_TRANSFER",
        remarks: data.remarks,
      },
      include: { user: { select: { email: true, firstName: true } } },
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
}
