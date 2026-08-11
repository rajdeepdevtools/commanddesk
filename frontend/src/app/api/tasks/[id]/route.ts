import { NextResponse } from "next/server";
import { TaskService } from "@/backend/services/task.service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { UpdateTaskSchema } from "@/features/tasks/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await authorize(PERMISSIONS.TASKS_VIEW);
    const { id } = await params;
    
    const task = await TaskService.getById(companyId, id);
    return NextResponse.json(task);
  } catch (error) {
    return apiError(error, "Unable to load task");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await authorize(PERMISSIONS.TASKS_MANAGE);
    const { id } = await params;
    const body = await request.json();
    
    const validatedData = UpdateTaskSchema.parse(body);
    
    const task = await TaskService.update(companyId, id, validatedData);
    return NextResponse.json(task);
  } catch (error) {
    return apiError(error, "Unable to update task");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await authorize(PERMISSIONS.TASKS_MANAGE);
    const { id } = await params;
    
    await TaskService.delete(companyId, id);
    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    return apiError(error, "Unable to delete task");
  }
}
