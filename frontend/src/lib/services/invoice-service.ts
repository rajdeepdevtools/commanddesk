import { prisma } from "@/lib/prisma";
import { addMonths, format } from "date-fns";

export interface CreateInvoiceItemInput {
  description: string;
  quantity: number;
  rate: number;
}

export class InvoiceService {
  static async getAll(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    return prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, companyName: true, phone: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: { client: true, company: true, items: true },
    });
  }

  static async generateInvoiceNumber(companyId: string): Promise<string> {
    const prefix = "INV";
    const count = await prisma.invoice.count({ where: { companyId } });
    const year = format(new Date(), "yyyy");
    return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
  }

  static async create(data: {
    companyId: string;
    clientId?: string;
    amount?: number;
    tax?: number;
    dueDate?: Date;
    notes?: string;
    items?: CreateInvoiceItemInput[];
  }) {
    const invoiceNumber = await this.generateInvoiceNumber(data.companyId);

    let calculatedAmount = data.amount || 0;
    const itemsData = (data.items || []).map((item) => {
      const itemAmount = (item.quantity || 1) * (item.rate || 0);
      return {
        description: item.description || "Service / Item",
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        amount: itemAmount,
      };
    });

    if (itemsData.length > 0) {
      calculatedAmount = itemsData.reduce((sum, i) => sum + i.amount, 0);
    }

    const taxAmount = data.tax || 0;
    const total = calculatedAmount + taxAmount;

    return prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: calculatedAmount,
        tax: taxAmount,
        total,
        dueDate: data.dueDate ? new Date(data.dueDate) : addMonths(new Date(), 1),
        notes: data.notes,
        companyId: data.companyId,
        clientId: data.clientId,
        ...(itemsData.length > 0
          ? {
              items: {
                create: itemsData,
              },
            }
          : {}),
      },
      include: { client: true, items: true },
    });
  }

  static async update(id: string, data: any) {
    return prisma.invoice.update({ where: { id }, data, include: { client: true, items: true } });
  }

  static async markAsPaid(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: { status: "PAID" as any, paidAt: new Date() },
    });
  }

  static async markAsOverdue(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: { status: "OVERDUE" as any },
    });
  }

  static async delete(id: string) {
    return prisma.invoice.update({
      where: { id },
      data: { status: "CANCELLED" as any },
    });
  }

  static async getStats(companyId: string) {
    const [total, paid, overdue, draft, totalRevenue] = await Promise.all([
      prisma.invoice.count({ where: { companyId } }),
      prisma.invoice.count({ where: { companyId, status: "PAID" as any } }),
      prisma.invoice.count({ where: { companyId, status: "OVERDUE" as any } }),
      prisma.invoice.count({ where: { companyId, status: "DRAFT" as any } }),
      prisma.invoice.aggregate({
        where: { companyId, status: "PAID" as any },
        _sum: { total: true },
      }),
    ]);
    return {
      total,
      paid,
      overdue,
      draft,
      totalRevenue: totalRevenue._sum.total || 0,
      collectionRate: total ? Math.round((paid / total) * 100) : 0,
    };
  }
}
