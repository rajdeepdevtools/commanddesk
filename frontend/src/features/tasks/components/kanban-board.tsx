"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, MessageSquare, Paperclip, MoreHorizontal, AlertCircle, PlayCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskTimeLogModal } from "./task-time-log-modal";

const COLUMNS = [
  { id: "TODO", title: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "REVIEW", title: "Review", color: "bg-yellow-50 dark:bg-yellow-900/20" },
  { id: "COMPLETED", title: "Done", color: "bg-green-50 dark:bg-green-900/20" },
];

interface KanbanBoardProps {
  projectId: string;
  tasks: any[];
}

export function KanbanBoard({ projectId, tasks: initialTasks }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [loggingTimeTask, setLoggingTimeTask] = useState<any | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const updateTask = useMutation({
    mutationFn: ({ taskId, status, orderIndex }: { taskId: string; status: string; orderIndex?: number }) =>
      apiClient.patch(`/tasks/${taskId}`, { status, orderIndex }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "project", projectId] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter((t: any) => t.status === status)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveATask) return;

    setTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const activeTask = tasks[activeIndex];

      if (isOverATask) {
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const overTask = tasks[overIndex];
        
        if (activeTask.status !== overTask.status) {
          return [
            ...tasks.slice(0, activeIndex),
            { ...activeTask, status: overTask.status },
            ...tasks.slice(activeIndex + 1),
          ];
        }
        return arrayMove(tasks, activeIndex, overIndex);
      }

      if (isOverAColumn) {
        if (activeTask.status !== overId) {
          return [
            ...tasks.slice(0, activeIndex),
            { ...activeTask, status: overId as string },
            ...tasks.slice(activeIndex + 1),
          ];
        }
      }

      return tasks;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const activeTask = tasks[activeIndex];
      let newTasks = tasks;

      const isOverATask = over.data.current?.type === "Task";
      if (isOverATask) {
        const overIndex = tasks.findIndex((t) => t.id === overId);
        newTasks = arrayMove(tasks, activeIndex, overIndex);
      }

      // Compute new order indexes
      const columnTasks = newTasks.filter((t) => t.status === activeTask.status);
      const newOrderIndex = columnTasks.findIndex((t) => t.id === activeTask.id);

      // Trigger mutation
      updateTask.mutate({
        taskId: activeTask.id,
        status: activeTask.status,
        orderIndex: newOrderIndex,
      });

      return newTasks;
    });
  };

  return (
    <div className="flex h-full flex-1 overflow-x-auto pb-4 gap-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((col) => (
          <KanbanColumn key={col.id} column={col} tasks={getTasksByStatus(col.id)} onLogTime={setLoggingTimeTask} />
        ))}
        
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {loggingTimeTask && (
        <TaskTimeLogModal task={loggingTimeTask} onClose={() => setLoggingTimeTask(null)} />
      )}
    </div>
  );
}

function KanbanColumn({ column, tasks, onLogTime }: { column: any; tasks: any[]; onLogTime?: (task: any) => void }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "Column" },
  });

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-2xl bg-gray-50/50 p-4 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-semibold text-midnight-navy dark:text-white">
            {column.title}
          </h3>
          <span className="flex h-5 items-center justify-center rounded-full bg-gray-200 px-2 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {tasks.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-3 min-h-[200px] overflow-y-auto">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} onLogTime={onLogTime} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-transparent dark:border-gray-700/50">
            <span className="text-sm font-medium text-gray-400">Drop tasks here</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableTask({ task, onLogTime }: { task: any; onLogTime?: (task: any) => void }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onLogTime={onLogTime} />
    </div>
  );
}

function TaskCard({ task, isOverlay, onLogTime }: { task: any; isOverlay?: boolean; onLogTime?: (task: any) => void }) {
  return (
    <div className={`group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all dark:border-gray-800 dark:bg-midnight-navy ${isOverlay ? 'scale-105 shadow-xl rotate-2 opacity-90' : 'hover:-translate-y-0.5 hover:shadow-md'}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          task.priority === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {task.priority || 'LOW'}
        </span>
      </div>
      
      <h4 className="font-heading text-sm font-semibold text-midnight-navy dark:text-white line-clamp-2">
        {task.title}
      </h4>
      
      {task.dueDate && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <Clock className="h-3.5 w-3.5" />
          <span className={new Date(task.dueDate) < new Date() ? 'text-red-500 font-bold' : ''}>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 dark:border-gray-800">
        <div className="flex items-center gap-3 text-gray-400">
          {task.estimatedHours && (
            <div className="flex items-center gap-1 text-xs">
              <span title="Logged hours">{task.spentHours || 0}</span>
              <span>/</span>
              <span title="Estimated hours">{task.estimatedHours}h</span>
            </div>
          )}
          {onLogTime && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent drag
                onLogTime(task);
              }}
              className="flex items-center gap-1 text-xs hover:text-primary-indigo transition-colors cursor-pointer z-10 relative"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <PlayCircle className="h-4 w-4" />
            </button>
          )}
        </div>
        {task.assignee && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-indigo/10 text-[10px] font-bold text-primary-indigo" title={task.assignee.firstName}>
            {task.assignee.firstName?.[0] || 'U'}
          </div>
        )}
      </div>
    </div>
  );
}
