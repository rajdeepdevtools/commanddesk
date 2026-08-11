import { prisma } from "@/lib/prisma";
import { CreateTaskInput, UpdateTaskInput } from "@/features/tasks/types";

export class TaskRepository {
  static async verifyProjectAccess(companyId: string, projectId: string) {
    return prisma.project.findFirst({
      where: { id: projectId, companyId },
      select: { id: true },
    });
  }

  static async verifyEmployeeAccess(companyId: string, employeeId: string) {
    return prisma.user.findFirst({
      where: { id: employeeId, companyId, isActive: true },
      select: { id: true },
    });
  }

  static async verifyTaskAccess(companyId: string, taskId: string) {
    return prisma.task.findFirst({
      where: { id: taskId, project: { companyId } },
      select: { id: true },
    });
  }

  static async getAll(companyId: string, projectId?: string) {
    return prisma.task.findMany({
      where: { project: { companyId }, projectId },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        project: { select: { id: true, name: true, color: true } },
        _count: { select: { subtasks: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        project: { select: { id: true, name: true, color: true } },
        milestone: true,
        subtasks: { include: { assignee: { select: { id: true, firstName: true, lastName: true } } } },
        comments: {
          include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  static async create(companyId: string, data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        priority: data.priority as any || "MEDIUM",
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  static async update(id: string, data: UpdateTaskInput) {
    return prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId === "" ? null : data.assigneeId,
        projectId: data.projectId === "" ? null : data.projectId,
        priority: data.priority as any,
        status: data.status as any,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completedAt: data.status === "COMPLETED" ? new Date() : undefined,
      },
      include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  static async delete(id: string) {
    return prisma.task.delete({ where: { id } });
  }

  static async getStats(companyId: string) {
    const [total, todo, inProgress, completed, overdue] = await Promise.all([
      prisma.task.count({ where: { project: { companyId } } }),
      prisma.task.count({ where: { project: { companyId }, status: "TODO" } }),
      prisma.task.count({ where: { project: { companyId }, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { project: { companyId }, status: "COMPLETED" } }),
      prisma.task.count({
        where: { project: { companyId }, dueDate: { lt: new Date() }, status: { not: "COMPLETED" } },
      }),
    ]);
    return { total, todo, inProgress, completed, overdue };
  }
}
