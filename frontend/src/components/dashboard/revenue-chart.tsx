"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 shadow-lg border border-border">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              ₹{(entry.value / 100000).toFixed(1)}L
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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
  const hasData = data.some((point) => point.revenue > 0 || point.expenses > 0);

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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "var(--primary)" }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="var(--teal)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "var(--teal)" }}
            />
          </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
