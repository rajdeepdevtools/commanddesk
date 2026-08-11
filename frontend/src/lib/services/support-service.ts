import { prisma } from "@/lib/prisma";
import { EmailService } from "../email/email-service";
import { getSupportTicketTemplate } from "../email/templates";
  // ================= TICKETS ================= //

  static async getTickets(companyId: string, userId: string, role: string) {
    const where: any = { companyId };
    
    // If not admin/support, only show their own tickets
    if (role === "EMPLOYEE" || role === "GUEST") {
      where.createdById = userId;
    }

    return prisma.ticket.findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createTicket(companyId: string, userId: string, data: any) {
    return prisma.ticket.create({
      data: {
        companyId,
        createdById: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || "MEDIUM",
        status: "OPEN",
      },
      include: { createdBy: { select: { firstName: true, email: true } } }
    });

    if (ticket.createdBy?.email) {
      EmailService.sendMail({
        to: ticket.createdBy.email,
        subject: `Support Ticket Received: ${ticket.title} 🎫`,
        html: getSupportTicketTemplate(ticket.createdBy.firstName, ticket.title, ticket.priority),
      }).catch(console.error);
    }

    return ticket;
  }

  static async updateTicket(companyId: string, ticketId: string, data: any) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    
    if (!ticket || ticket.companyId !== companyId) {
      throw new Error("Ticket not found");
    }

    return prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: data.status !== undefined ? data.status : undefined,
        priority: data.priority !== undefined ? data.priority : undefined,
        assignedToId: data.assignedToId !== undefined ? data.assignedToId : undefined,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      }
    });
  }

  // ================= COMMENTS ================= //

  static async getComments(ticketId: string) {
    return prisma.ticketComment.findMany({
      where: { ticketId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  static async addComment(ticketId: string, authorId: string, data: { content: string; isInternal?: boolean }) {
    // Optionally update ticket updated_at
    await prisma.ticket.update({ where: { id: ticketId }, data: { updatedAt: new Date() } });

    return prisma.ticketComment.create({
      data: {
        ticketId,
        authorId,
        content: data.content,
        isInternal: data.isInternal || false,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
      }
    });
  }
}
