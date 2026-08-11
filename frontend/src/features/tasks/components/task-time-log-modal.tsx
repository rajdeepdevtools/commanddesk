import React, { useState } from "react";
import { X, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface TaskTimeLogModalProps {
  task: any;
  onClose: () => void;
}

export function TaskTimeLogModal({ task, onClose }: TaskTimeLogModalProps) {
  const queryClient = useQueryClient();
  const [hours, setHours] = useState("");

  const logTime = useMutation({
    mutationFn: () =>
      apiClient.patch(`/tasks/${task.id}`, {
        spentHours: (task.spentHours || 0) + parseFloat(hours),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || isNaN(parseFloat(hours))) return;
    logTime.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-midnight-navy border border-gray-100 dark:border-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-midnight-navy dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-indigo" />
            Log Time
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
          Logging hours for <span className="font-semibold text-gray-700 dark:text-gray-200">{task.title}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Hours Worked
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              autoFocus
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={logTime.isPending || !hours}
              className="flex-1 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-primary-indigo/90 disabled:opacity-50"
            >
              {logTime.isPending ? "Saving..." : "Log Hours"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
