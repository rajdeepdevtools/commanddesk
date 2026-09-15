import "server-only";

import { prisma } from "@/prisma";
import { EmployeeService } from "@/services/employee-service";
import { ProjectService } from "@/services/project-service";
import { TaskService } from "@/services/task-service";
import { LeadService } from "@/services/lead-service";
import { InvoiceService } from "@/services/invoice-service";
import { AttendanceService } from "@/services/attendance-service";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type ActivityItem = {
  id: string;
  action: string;
  detail: string;
  at: string;
  href: string;
};

export class DashboardService {
  /**
   * Revenue and expenses for the trailing 12 months, bucketed by month.
   * Two grouped queries rather than 24 aggregates.
   */
  static async getRevenueSeries(companyId: string) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [invoices, expenses] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          companyId,
          status: "PAID" as never,
          paidAt: { gte: start },
        },
        select: { total: true, paidAt: true },
      }),
      prisma.expense.findMany({
        where: { companyId, date: { gte: start } },
        select: { amount: true, date: true },
      }),
    ]);

    // Pre-seed 12 buckets so months with no activity still render.
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: MONTH_LABELS[d.getMonth()],
        revenue: 0,
        expenses: 0,
      };
    });
    const index = new Map(buckets.map((b) => [b.key, b]));

    for (const inv of invoices) {
      const d = inv.paidAt;
      if (!d) continue;
      const bucket = index.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (bucket) bucket.revenue += Number(inv.total ?? 0);
    }
    for (const exp of expenses) {
      const d = exp.date;
      const bucket = index.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (bucket) bucket.expenses += Number(exp.amount ?? 0);
    }

    return buckets.map(({ name, revenue, expenses: e }) => ({
      name,
      revenue,
      expenses: e,
    }));
  }

  /**
   * Recent cross-entity activity, replacing the hardcoded feed. Each source is
   * capped, then merged and trimmed - so this is 4 small indexed queries.
   */
  static async getRecentActivity(companyId: string): Promise<ActivityItem[]> {
    const [projects, tasks, leads, invoices] = await Promise.all([
      prisma.project.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, createdAt: true },
      }),
      prisma.task.findMany({
        where: { project: { companyId }, status: "COMPLETED" as never },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, updatedAt: true, projectId: true },
      }),
      prisma.lead.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, budget: true, createdAt: true },
      }),
      prisma.invoice.findMany({
        where: { companyId, status: "PAID" as never },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, invoiceNumber: true, total: true, updatedAt: true },
      }),
    ]);

    const items: ActivityItem[] = [
      ...projects.map((p) => ({
        id: `project-${p.id}`,
        action: "New project created",
        detail: p.name,
        at: p.createdAt.toISOString(),
        href: `/projects/${p.id}`,
      })),
      ...tasks.map((t) => ({
        id: `task-${t.id}`,
        action: "Task completed",
        detail: t.title,
        at: t.updatedAt.toISOString(),
        href: t.projectId ? `/projects/${t.projectId}` : "/tasks",
      })),
      ...leads.map((l) => ({
        id: `lead-${l.id}`,
        action: "Lead added",
        detail: l.budget ? `${l.name} — ₹${Number(l.budget).toLocaleString("en-IN")}` : l.name,
        at: l.createdAt.toISOString(),
        href: "/leads",
      })),
      ...invoices.map((i) => ({
        id: `invoice-${i.id}`,
        action: "Invoice paid",
        detail: i.invoiceNumber ?? `₹${Number(i.total ?? 0).toLocaleString("en-IN")}`,
        at: i.updatedAt.toISOString(),
        href: "/finance/invoices",
      })),
    ];

    return items
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 8);
  }

  /**
   * Everything the admin dashboard needs, in one round trip. Each underlying
   * service already scopes by companyId.
   */
  static async getOverview(companyId: string) {
    const [
      employees,
      projects,
      tasks,
      leads,
      invoices,
      attendance,
      revenueSeries,
      activity,
    ] = await Promise.all([
      EmployeeService.getStats(companyId).catch(() => null),
      ProjectService.getStats(companyId).catch(() => null),
      TaskService.getStats(companyId).catch(() => null),
      LeadService.getStats(companyId).catch(() => null),
      InvoiceService.getStats(companyId).catch(() => null),
      AttendanceService.getStats(companyId).catch(() => null),
      DashboardService.getRevenueSeries(companyId).catch(() => []),
      DashboardService.getRecentActivity(companyId).catch(() => []),
    ]);

    return {
      stats: {
        revenue: invoices?.totalRevenue ?? 0,
        activeEmployees: employees?.total ?? 0,
        activeProjects: projects?.active ?? 0,
        leads: leads?.total ?? 0,
        attendanceRate: attendance?.attendanceRate ?? 0,
        tasksCompleted: tasks?.completed ?? 0,
      },
      detail: { employees, projects, tasks, leads, invoices, attendance },
      revenueSeries,
      activity,
    };
  }
}
