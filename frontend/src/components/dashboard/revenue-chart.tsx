"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface RevenuePoint {
  name: string;
  revenue: number;
  expenses: number;
}

interface RevenueChartProps {
  className?: string;
  data?: RevenuePoint[];
  isLoading?: boolean;
}

export function RevenueChart({ className, data = [], isLoading }: RevenueChartProps) {
  const { theme } = useTheme();
  const hasData = data.some((point) => point.revenue > 0 || point.expenses > 0);

  const chartOptions: any = {
    chart: {
      type: "area",
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "var(--font-body)",
    },
    theme: {
      mode: theme === "dark" ? "dark" : "light",
    },
    colors: ["#6366f1", "#14b8a6"], // Indigo for revenue, Teal for expenses
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
      },
    },
    xaxis: {
      categories: data.map((d) => d.name),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "var(--muted-foreground)" } },
    },
    yaxis: {
      labels: {
        style: { colors: "var(--muted-foreground)" },
        formatter: (value: number) => `₹${(value / 100000).toFixed(0)}L`,
      },
    },
    grid: {
      borderColor: "var(--border)",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: {
      theme: theme === "dark" ? "dark" : "light",
      y: {
        formatter: (value: number) => `₹${(value / 100000).toFixed(1)}L`,
      },
    },
  };

  const chartSeries = [
    {
      name: "Revenue",
      data: data.map((d) => d.revenue),
    },
    {
      name: "Expenses",
      data: data.map((d) => d.expenses),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className={cn("stat-card", className)}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">
            Paid invoices vs expenses, last 12 months
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal" />
            <span className="text-xs text-muted-foreground">Expenses</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-full w-full animate-pulse rounded-xl bg-muted" />
          </div>
        ) : !hasData ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-foreground">No financial activity yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              This chart fills in as invoices are marked paid and expenses are recorded.
            </p>
          </div>
        ) : (
          <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
        )}
      </div>
    </motion.div>
  );
}
