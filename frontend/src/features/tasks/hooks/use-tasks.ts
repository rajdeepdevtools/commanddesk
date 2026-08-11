import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { CreateTaskInput, UpdateTaskInput } from "../types";

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  dueDate?: string | null;
  projectId?: string | null;
  project?: { id: string; name: string; color?: string } | null;
  assignee?: { id: string; firstName: string; lastName: string; avatarUrl?: string | null } | null;
};

export type Project = { id: string; name: string };
export type Employee = { id: string; firstName: string; lastName: string };

export function useTasks() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => apiClient.get("/tasks").then((res) => res.data),
  });

  const projectsQuery = useQuery<Project[]>({
    queryKey: ["projects", "task-form"],
    queryFn: () => apiClient.get("/projects").then((res) => res.data),
  });

  const employeesQuery = useQuery<Employee[]>({
    queryKey: ["employees", "task-form"],
    queryFn: () => apiClient.get("/employees").then((res) => res.data),
  });

  const createTask = useMutation({
    mutationFn: (form: CreateTaskInput) => apiClient.post("/tasks", {
      ...form,
      assigneeId: form.assigneeId || undefined,
      dueDate: form.dueDate || undefined,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateTaskInput) =>
      apiClient.patch(`/tasks/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return {
    tasksQuery,
    projectsQuery,
    employeesQuery,
    createTask,
    updateTask,
    deleteTask,
  };
}
