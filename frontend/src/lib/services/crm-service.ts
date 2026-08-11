import { prisma } from "@/lib/prisma";

export class CrmService {
  static async getClientById(companyId: string, id: string) {
    return prisma.client.findUnique({ where: { id } });
  }

  // ================= LEADS ================= //

  static async getLeads(companyId: string) {
    return prisma.lead.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createLead(companyId: string, data: any) {
    return prisma.lead.create({
      data: {
        companyId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: data.source,
        budget: data.budget ? parseFloat(data.budget.toString()) : null,
        notes: data.notes,
        score: data.score ? parseInt(data.score.toString()) : 0,
        status: data.status || "NEW",
      },
    });
  }

  static async updateLeadStatus(companyId: string, leadId: string, status: any) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.companyId !== companyId) {
      throw new Error("Lead not found");
    }

    const data: any = { status };
    if (status === "WON" && lead.status !== "WON") {
      data.convertedAt = new Date();
    }

    return prisma.lead.update({
      where: { id: leadId },
      data,
    });
  }

  static async convertLeadToClient(companyId: string, leadId: string) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.companyId !== companyId) {
      throw new Error("Lead not found");
    }

    if (lead.clientId) {
      return prisma.client.findUnique({ where: { id: lead.clientId } });
    }

    // Wrap in transaction
    return prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          companyId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          companyName: lead.name, // Fallback
          notes: lead.notes,
        },
      });

      await tx.lead.update({
        where: { id: leadId },
        data: {
          status: "WON",
          convertedAt: new Date(),
          clientId: client.id,
        },
      });

      return client;
    });
  }

  // ================= CLIENTS ================= //

  static async getClients(companyId: string) {
    return prisma.client.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { invoices: true, leads: true },
        },
      },
    });
  }

  static async createClient(companyId: string, data: any) {
    return prisma.client.create({
      data: {
        companyId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        website: data.website,
        address: data.address,
        gst: data.gst,
      },
    });
  }
}
