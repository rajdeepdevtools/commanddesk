import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock, LayoutList, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTasks } from "../hooks/use-tasks";

export function TaskList() {
  const { tasksQuery, updateTask, deleteTask } = useTasks();
  
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (tasksQuery.data ?? []).filter((task) => {
      const statusMatches =
        filter === "ALL" ||
        (filter === "ACTIVE" && task.status !== "COMPLETED") ||
        (filter === "COMPLETED" && task.status === "COMPLETED");
      return statusMatches && (!term || `${task.title} ${task.project?.name ?? ""}`.toLowerCase().includes(term));
    });
  }, [filter, search, tasksQuery.data]);

  if (tasksQuery.isLoading) {
    return <div className="py-16 text-center text-sm text-gray-500">Loading tasks...</div>;
  }

  if (tasksQuery.error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{tasksQuery.error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {["ALL", "ACTIVE", "COMPLETED"].map((status) => (
            <button key={status} onClick={() => setFilter(status)} className={`rounded-xl px-4 py-2 text-sm font-medium ${filter === status ? "bg-primary-indigo text-white" : "bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>{status}</button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-3 dark:border-gray-700 dark:bg-midnight-navy" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center py-16"><LayoutList className="mb-4 h-12 w-12 text-gray-300" /><h3 className="font-medium">No tasks in this view</h3></div>
        ) : filteredTasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between gap-4 border-b border-gray-100 p-4 last:border-0 dark:border-gray-800">
            <div className="flex min-w-0 items-center gap-4">
              <button onClick={() => updateTask.mutate({ id: task.id, status: task.status === "COMPLETED" ? "TODO" : "COMPLETED" })} disabled={updateTask.isPending}>
                {task.status === "COMPLETED" ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-gray-300" />}
              </button>
              <div className="min-w-0">
                <h4 className={`truncate font-medium ${task.status === "COMPLETED" ? "text-gray-400 line-through" : ""}`}>{task.title}</h4>
                <div className="mt-1 flex gap-3 text-xs text-gray-500">
                  {task.project && <Link href={`/projects/${task.project.id}`} className="hover:text-primary-indigo">{task.project.name}</Link>}
                  {task.dueDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select value={task.status} onChange={(e) => updateTask.mutate({ id: task.id, status: e.target.value as any })} className="rounded-lg border border-gray-200 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900">
                <option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="REVIEW">Review</option><option value="TESTING">Testing</option><option value="COMPLETED">Completed</option>
              </select>
              <button onClick={() => window.confirm("Delete this task?") && deleteTask.mutate(task.id)} aria-label="Delete task" className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
