import { prisma } from "@/lib/prisma";
import { EmailService } from "../email/email-service";
import { getTaskAssignedTemplate } from "../email/templates";

export class TaskService {
  static async addComment(taskId: string, userId: string, content: string) {
    return { id: "mock", content };
  }
  static async getStats(companyId: string, userId?: string) {
    const where: any = { project: { companyId } };
    if (userId) {
      where.assigneeId = userId;
    }
    const [total, completed, inProgress, todo] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: "COMPLETED" as any } }),
      prisma.task.count({ where: { ...where, status: "IN_PROGRESS" as any } }),
      prisma.task.count({ where: { ...where, status: "TODO" as any } }),
    ]);
    return { total, completed, inProgress, todo };
  }

  /**
   * Create a new task and notify the assignee.
   */
  static async createTask(data: any, createdById: string) {
    const newTask = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || "TODO",
        priority: data.priority || "MEDIUM",
        estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: data.projectId || null,
        assigneeId: data.assigneeId || null,
      },
      include: {
        assignee: { select: { id: true, firstName: true, email: true } },
        project: { select: { id: true, name: true } },
      }
    });

    // Notify Assignee
    if (newTask.assignee?.email && newTask.assignee.id !== createdById) {
      EmailService.sendMail({
        to: newTask.assignee.email,
        subject: `New Task Assigned: ${newTask.title} ✅`,
        html: getTaskAssignedTemplate(
          newTask.assignee.firstName,
          newTask.title,
          newTask.priority,
          newTask.project?.name
        )
      }).catch(console.error);
    }

    return newTask;
  }

  /**
   * Get tasks for a specific user (either assigned to them or in a project they are part of)
   */
  static async getTasksByUser(userId: string) {
    return prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { name: true, color: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Update task status (e.g. Kanban drag and drop)
   */
  static async updateTaskStatus(taskId: string, status: any) {
    return prisma.task.update({
      where: { id: taskId },
      data: { status, updatedAt: new Date() }
    });
  }
}
