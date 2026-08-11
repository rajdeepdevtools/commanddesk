import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { useTasks } from "../hooks/use-tasks";

type TaskFormProps = {
  onClose: () => void;
};

export function TaskForm({ onClose }: TaskFormProps) {
  const { projectsQuery, employeesQuery, createTask } = useTasks();
  
  const [form, setForm] = useState({
    title: "", description: "", projectId: "", assigneeId: "", priority: "MEDIUM", dueDate: "",
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    createTask.mutate(form as any, {
      onSuccess: () => {
        setForm({ title: "", description: "", projectId: "", assigneeId: "", priority: "MEDIUM", dueDate: "" });
        onClose();
      }
    });
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create task</h2>
        <button type="button" onClick={onClose} aria-label="Close task form"><X className="h-5 w-5" /></button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">Task title
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 dark:border-gray-700 dark:bg-gray-900" />
        </label>
        <label className="text-sm font-medium">Project
          <select required value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 dark:border-gray-700 dark:bg-gray-900">
            <option value="">Select project</option>
            {(projectsQuery.data ?? []).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">Assignee
          <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 dark:border-gray-700 dark:bg-gray-900">
            <option value="">Unassigned</option>
            {(employeesQuery.data ?? []).map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">Priority
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 dark:border-gray-700 dark:bg-gray-900">
              <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option>
            </select>
          </label>
          <label className="text-sm font-medium">Due date
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-3 dark:border-gray-700 dark:bg-gray-900" />
          </label>
        </div>
        <label className="text-sm font-medium md:col-span-2">Description
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
        </label>
      </div>
      {createTask.error && <p className="mt-3 text-sm text-red-600">{createTask.error.message}</p>}
      <div className="mt-4 flex justify-end">
        <button disabled={createTask.isPending || !form.projectId} className="rounded-xl bg-primary-indigo px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {createTask.isPending ? "Creating..." : "Create Task"}
        </button>
      </div>
    </form>
  );
}
