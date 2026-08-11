import { NextResponse } from "next/server";
import { TaskService } from "@/backend/services/task.service";
import { authorize } from "@/lib/saas/authorize";
import { apiError } from "@/lib/saas/api-error";
import { PERMISSIONS } from "@/lib/saas/permissions";
import { CreateTaskSchema } from "@/features/tasks/types";

export async function GET(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.TASKS_VIEW);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || undefined;
    
    const tasks = await TaskService.getAll(companyId, projectId);
    return NextResponse.json(tasks);
  } catch (error) {
    return apiError(error, "Unable to load tasks");
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await authorize(PERMISSIONS.TASKS_MANAGE);
    const body = await request.json();
    
    const validatedData = CreateTaskSchema.parse(body);
    
    const task = await TaskService.create(companyId, validatedData);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return apiError(error, "Unable to create task");
  }
}
