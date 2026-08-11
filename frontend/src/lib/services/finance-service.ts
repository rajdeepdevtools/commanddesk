import { prisma } from "@/lib/prisma";

export class FinanceService {
  // ================= INVOICES ================= //

  static async getInvoices(companyId: string) {
    return prisma.invoice.findMany({
      where: { companyId },
      include: {
        client: {
          select: { id: true, name: true, companyName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createInvoice(companyId: string, data: any) {
    // Generate a simple invoice number if not provided
    let invoiceNumber = data.invoiceNumber;
    if (!invoiceNumber) {
      const count = await prisma.invoice.count({ where: { companyId } });
      invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    }

    const amount = parseFloat(data.amount.toString());
    const tax = data.tax ? parseFloat(data.tax.toString()) : 0;
    const total = amount + tax;

    return prisma.invoice.create({
      data: {
        companyId,
        clientId: data.clientId,
        invoiceNumber,
        amount,
        tax,
        total,
        status: data.status || "DRAFT",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes,
      },
    });
  }

  static async updateInvoiceStatus(companyId: string, invoiceId: string, status: any) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.companyId !== companyId) {
      throw new Error("Invoice not found");
    }

    const data: any = { status };
    if (status === "PAID" && invoice.status !== "PAID") {
      data.paidAt = new Date();
    }

    return prisma.invoice.update({
      where: { id: invoiceId },
      data,
    });
  }

  // ================= EXPENSES ================= //

  static async getExpenses(companyId: string) {
    return prisma.expense.findMany({
      where: { companyId },
      orderBy: { date: "desc" },
    });
  }

  static async createExpense(companyId: string, data: any) {
    return prisma.expense.create({
      data: {
        companyId,
        description: data.description,
        amount: parseFloat(data.amount.toString()),
        category: data.category,
        date: data.date ? new Date(data.date) : new Date(),
        notes: data.notes,
      },
    });
  }

  // ================= DASHBOARD STATS ================= //

  static async getDashboardStats(companyId: string) {
    const invoices = await prisma.invoice.findMany({ where: { companyId } });
    const expenses = await prisma.expense.findMany({ where: { companyId } });

    const totalRevenue = invoices
      .filter((i: any) => i.status === "PAID")
      .reduce((sum: number, i: any) => sum + i.total, 0);

    const pendingRevenue = invoices
      .filter((i: any) => i.status === "SENT" || i.status === "OVERDUE")
      .reduce((sum: number, i: any) => sum + i.total, 0);

    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      pendingRevenue,
      totalExpenses,
      netProfit,
    };
  }
}
