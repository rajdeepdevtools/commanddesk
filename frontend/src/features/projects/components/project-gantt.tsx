"use client";

import React, { useState } from "react";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Calendar } from "lucide-react";

interface ProjectGanttProps {
  tasks: any[];
}

export function ProjectGantt({ tasks }: ProjectGanttProps) {
  const [view, setView] = useState<ViewMode>(ViewMode.Day);

  const ganttTasks: GanttTask[] = tasks
    .filter((task) => task.startDate || task.dueDate)
    .map((task) => {
      const start = task.startDate ? new Date(task.startDate) : new Date();
      // If no due date, default to 1 day after start
      const end = task.dueDate ? new Date(task.dueDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
      
      // Ensure end is after start for Gantt component
      if (end.getTime() <= start.getTime()) {
        end.setTime(start.getTime() + 24 * 60 * 60 * 1000);
      }

      return {
        id: task.id,
        type: "task",
        name: task.title,
        start,
        end,
        progress: task.status === "COMPLETED" ? 100 : task.status === "IN_PROGRESS" ? 50 : task.status === "REVIEW" ? 90 : 0,
        isDisabled: false,
        styles: {
          progressColor: "#6366f1", // primary-indigo
          progressSelectedColor: "#4f46e5",
          backgroundColor: task.status === "COMPLETED" ? "#10b981" : "#818cf8",
        },
      };
    });

  if (ganttTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-midnight-navy">
        <Calendar className="h-10 w-10 text-gray-400 mb-2" />
        <p className="text-gray-500 font-medium">No tasks with dates assigned.</p>
        <p className="text-sm text-gray-400 mt-1">Add start and due dates to tasks to see them in the timeline.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading font-semibold text-midnight-navy dark:text-white">Project Timeline</h3>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => setView(ViewMode.Day)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              view === ViewMode.Day
                ? "bg-white text-primary-indigo shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setView(ViewMode.Week)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              view === ViewMode.Week
                ? "bg-white text-primary-indigo shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView(ViewMode.Month)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              view === ViewMode.Month
                ? "bg-white text-primary-indigo shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Month
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto custom-gantt">
        <Gantt
          tasks={ganttTasks}
          viewMode={view}
          listCellWidth="155px"
          columnWidth={view === ViewMode.Month ? 150 : view === ViewMode.Week ? 150 : 60}
          barCornerRadius={8}
          barFill={70}
          barProgressColor="#6366f1"
          barProgressSelectedColor="#4f46e5"
          arrowColor="#94a3b8"
          todayColor="rgba(99, 102, 241, 0.1)"
        />
      </div>
    </div>
  );
}
