"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskList } from "./task-list";
import { TaskForm } from "./task-form";

export function TasksDashboard() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">Create, assign, track, and complete work across projects.</p>
        </div>
        <button 
          onClick={() => setShowForm((value) => !value)} 
          className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
      
      <TaskList />
    </div>
  );
}
