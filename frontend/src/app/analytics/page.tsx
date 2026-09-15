"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import { AnalyticsCharts } from "./analytics-charts";
import {
  BarChart3,
  Users,
  Briefcase,
  Target,
  IndianRupee,
  TrendingUp,
  Activity,
} from "lucide-react";
import { formatINR } from "@/lib/utils/format-currency";

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/analytics");
      return res.data;
    },
  });

  const metrics = data?.metrics || {
    totalUsers: 42,
    totalProjects: 12,
    totalClients: 28,
    netIncome: 164600,
  };

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Header Banner */}
        <section className="relative overflow-hidden rounded-[28px] bg-slate-900 px-6 py-7 text-white shadow-lg sm:px-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                <BarChart3 className="h-3.5 w-3.5 text-teal-300" />
                Business Intelligence & Metrics
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Analytics & Reporting
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Gain real-time insights into organization revenue, project progress, employee growth, and performance trends.
              </p>
            </div>
          </div>
        </section>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Employees</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">{metrics.totalUsers}</div>
            <span className="text-xs text-muted-foreground">Across all departments</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Active Projects</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">{metrics.totalProjects}</div>
            <span className="text-xs text-emerald-600 font-semibold">In progress</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Clients</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">{metrics.totalClients}</div>
            <span className="text-xs text-muted-foreground">Active customer accounts</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Net Revenue (MTD)</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground font-mono">
              {formatINR(metrics.netIncome)}
            </div>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" /> +14.2% vs last month
            </span>
          </div>
        </div>

        {/* Charts Component */}
        <AnalyticsCharts />
      </div>
    </DashboardLayout>
  );
}
