'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { use, useState } from 'react';
import { ArrowLeft, Plus, LayoutDashboard, KanbanSquare, BarChart, List } from 'lucide-react';
import Link from 'next/link';
import { KanbanBoard } from '@/features/tasks/components/kanban-board';
import { ProjectGantt } from '@/features/projects/components/project-gantt';

export default function ProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'timeline' | 'list'>('kanban');
  
  // Need project details
  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiClient.get(`/projects`).then((res) => res.data.find((p: any) => p.id === id)),
  });

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', 'project', id],
    queryFn: () => apiClient.get(`/tasks?projectId=${id}`).then((res) => res.data),
  });

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-6rem)] flex-col space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects" className="flex items-center justify-center rounded-xl bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-midnight-navy dark:bg-midnight-navy dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-bold text-midnight-navy dark:text-white">
                {project ? project.name : 'Project Workspace'}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase ${
                  project?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  project?.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {project?.status || 'LOADING...'}
                </span>
                {project?.budget && (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Budget: ₹{project.budget.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 mr-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-indigo/20 text-xs font-bold text-primary-indigo dark:border-midnight-navy">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <Link href="/tasks" className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-indigo/90">
              <Plus className="h-4 w-4" />
              New Task
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex shrink-0 items-center gap-6 border-b border-gray-100 px-2 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-indigo text-primary-indigo'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'kanban'
                ? 'border-primary-indigo text-primary-indigo'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <KanbanSquare className="h-4 w-4" /> Kanban Board
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'timeline'
                ? 'border-primary-indigo text-primary-indigo'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <BarChart className="h-4 w-4" /> Timeline (Gantt)
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'list'
                ? 'border-primary-indigo text-primary-indigo'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <List className="h-4 w-4" /> List View
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-indigo border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            Failed to load project tasks.
          </div>
        )}

        {/* Tab Content */}
        {!isLoading && !error && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {activeTab === 'overview' && (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy md:col-span-2">
                  <h3 className="font-heading font-semibold text-midnight-navy dark:text-white mb-4">Project Description</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {project?.description || 'No description provided.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
                  <h3 className="font-heading font-semibold text-midnight-navy dark:text-white mb-4">Project Lead</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-indigo/10 text-primary-indigo font-bold">
                      {project?.lead?.firstName?.[0] || 'L'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-midnight-navy dark:text-white">
                        {project?.lead?.firstName} {project?.lead?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{project?.lead?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kanban' && (
              <KanbanBoard projectId={id} tasks={tasks || []} />
            )}

            {activeTab === 'timeline' && (
              <ProjectGantt tasks={tasks || []} />
            )}

            {activeTab === 'list' && (
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-midnight-navy overflow-hidden">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                    <tr>
                      <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Task Name</th>
                      <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Priority</th>
                      <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Assignee</th>
                      <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {tasks?.map((task: any) => (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-4 font-medium text-midnight-navy dark:text-white">{task.title}</td>
                        <td className="p-4">
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {task.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority || 'LOW'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                    {(!tasks || tasks.length === 0) && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">No tasks found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
