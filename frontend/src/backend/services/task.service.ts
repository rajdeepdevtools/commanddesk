import { TaskRepository } from "@/backend/repositories/task.repository";
import { CreateTaskInput, UpdateTaskInput } from "@/features/tasks/types";

export class TaskService {
  static async getAll(companyId: string, projectId?: string) {
    return TaskRepository.getAll(companyId, projectId);
  }

  static async getById(companyId: string, id: string) {
    const access = await TaskRepository.verifyTaskAccess(companyId, id);
    if (!access) throw new Error("Task not found or access denied");
    
    return TaskRepository.getById(id);
  }

  static async create(companyId: string, data: CreateTaskInput) {
    // Business logic validations
    const project = await TaskRepository.verifyProjectAccess(companyId, data.projectId);
    if (!project) {
      throw new Error("Project not found or access denied");
    }

    if (data.assigneeId) {
      const assignee = await TaskRepository.verifyEmployeeAccess(companyId, data.assigneeId);
      if (!assignee) {
        throw new Error("Assignee not found or inactive");
      }
    }

    return TaskRepository.create(companyId, data);
  }

  static async update(companyId: string, id: string, data: UpdateTaskInput) {
    const access = await TaskRepository.verifyTaskAccess(companyId, id);
    if (!access) throw new Error("Task not found or access denied");
    
    if (data.assigneeId) {
      const assignee = await TaskRepository.verifyEmployeeAccess(companyId, data.assigneeId);
      if (!assignee) {
        throw new Error("Assignee not found or inactive");
      }
    }
    
    return TaskRepository.update(id, data);
  }

  static async delete(companyId: string, id: string) {
    const access = await TaskRepository.verifyTaskAccess(companyId, id);
    if (!access) throw new Error("Task not found or access denied");
    
    return TaskRepository.delete(id);
  }

  static async getStats(companyId: string) {
    return TaskRepository.getStats(companyId);
  }
}
