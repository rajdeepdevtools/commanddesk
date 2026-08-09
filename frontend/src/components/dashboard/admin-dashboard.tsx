"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { StatsCards, type DashboardStats } from "@/components/dashboard/stats-cards";
import { RevenueChart, type RevenuePoint } from "@/components/dashboard/revenue-chart";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/activity-feed";
import Link from "next/link";
import { AlertCircle, Building2, ShieldCheck } from "lucide-react";

const quickActionRoutes: Record<string, string> = {
  "New Project": "/projects",
  "Add Employee": "/employees",
  "Create Invoice": "/finance/invoices",
  "New Task": "/tasks",
  "Add Lead": "/crm",
  "Run Report": "/analytics",
};

interface DashboardOverview {
  stats: DashboardStats;
  revenueSeries: RevenuePoint[];
  activity: ActivityItem[];
}

interface AdminDashboardProps {
  userName?: string;
  role?: string;
}

export function AdminDashboard({ userName = "Admin", role = "ORGANIZATION_OWNER" }: AdminDashboardProps) {
  const { data, isLoading, isError, error, refetch } = useQuery<DashboardOverview>({
    queryKey: ["dashboard-overview"],
    queryFn: () => apiClient.get("/dashboard").then((res) => res.data),
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 rounded-2xl bg-midnight-navy p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Executive Workspace ({role.replace(/_/g, " ")})
          </div>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white">
            Welcome back, {userName}!
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Here&apos;s your high-level organization performance overview and business analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-semibold text-slate-300">
          <Building2 className="h-4 w-4 text-primary-indigo" />
          <span>{role.replace(/_/g, " ")}</span>
        </div>
      </div>

      {isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4"
        >
          <span className="flex items-center gap-2 text-sm text-danger">
            <AlertCircle className="h-4 w-4" />
            {(error as any)?.response?.data?.error ||
              "Dashboard data could not be loaded."}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards stats={data?.stats} isLoading={isLoading} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={data?.revenueSeries} isLoading={isLoading} />
        <ActivityFeed items={data?.activity} isLoading={isLoading} />
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
        <h3 className="mb-4 font-heading text-lg font-semibold text-midnight-navy dark:text-white">
          Admin Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[
            { label: "New Project", icon: "📋" },
            { label: "Add Employee", icon: "👤" },
            { label: "Create Invoice", icon: "📄" },
            { label: "New Task", icon: "✅" },
            { label: "Add Lead", icon: "🎯" },
            { label: "Run Report", icon: "📊" },
          ].map((action, i) => (
            <Link
              key={i}
              href={quickActionRoutes[action.label]}
              aria-label={`${action.label} — open module`}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary-indigo/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-indigo focus-visible:ring-offset-2 active:translate-y-0 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-indigo/40"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
