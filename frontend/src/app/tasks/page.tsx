"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TasksDashboard } from "@/features/tasks/components/tasks-dashboard";

export default function TasksPage() {
  return (
    <DashboardLayout>
      <TasksDashboard />
    </DashboardLayout>
  );
}
