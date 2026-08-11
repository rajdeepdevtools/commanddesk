import { NextResponse } from "next/server";
import { SupportService } from "@/lib/services/support-service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { z } from "zod";
import { getUserSession } from "@/lib/auth/session";

const CreateTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().optional(),
  priority: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    // Both view and manage can see tickets, but getTickets filters based on role internally
    const { companyId } = await authorize(PERMISSIONS.SUPPORT_VIEW);
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tickets = await SupportService.getTickets(companyId, session.user.id, session.user.role);
    return NextResponse.json(tickets);
  } catch (error) {
    return apiError(error, "Unable to load tickets");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.SUPPORT_VIEW); // Employees can create
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validatedData = CreateTicketSchema.parse(body);
    
    const ticket = await SupportService.createTicket(companyId, session.user.id, validatedData);
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create ticket");
  }
}
