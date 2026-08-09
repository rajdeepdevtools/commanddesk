"use client";

import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  Target,
  Briefcase,
  CalendarCheck,
  CheckSquare,
} from "lucide-react";

export interface DashboardStats {
  revenue: number;
  activeEmployees: number;
  activeProjects: number;
  leads: number;
  attendanceRate: number;
  tasksCompleted: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  format?: "currency" | "number" | "percent";
  href?: string;
  delay?: number;
}

function formatValue(value: number, fmt: StatCardProps["format"]) {
  if (fmt === "currency") return `₹${formatNumber(value)}`;
  if (fmt === "percent") return `${value}%`;
  return formatNumber(value);
}

function StatCard({ title, value, icon, format: fmt = "number", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className="stat-card group"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">{icon}</div>
      </div>
      <div>
        <p className="mb-1 text-sm text-muted-foreground">{title}</p>
        <h3 className="font-mono text-2xl font-bold text-foreground">
          {formatValue(value, fmt)}
        </h3>
      </div>
    </motion.div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="stat-card" aria-hidden="true">
      <div className="mb-4 h-10 w-10 animate-pulse rounded-xl bg-muted" />
      <div className="mb-2 h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-7 w-20 animate-pulse rounded bg-muted" />
    </div>
  );
}

interface StatsCardsProps {
  className?: string;
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function StatsCards({ className, stats, isLoading }: StatsCardsProps) {
  const grid = cn(
    "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    className,
  );

  if (isLoading || !stats) {
    return (
      <div className={grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards: StatCardProps[] = [
    {
      title: "Revenue",
      value: stats.revenue,
      icon: <DollarSign size={20} />,
      format: "currency",
    },
    {
      title: "Active Employees",
      value: stats.activeEmployees,
      icon: <Users size={20} />,
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: <Briefcase size={20} />,
    },
    {
      title: "Leads",
      value: stats.leads,
      icon: <Target size={20} />,
    },
    {
      title: "Attendance",
      value: stats.attendanceRate,
      icon: <CalendarCheck size={20} />,
      format: "percent",
    },
    {
      title: "Tasks Completed",
      value: stats.tasksCompleted,
      icon: <CheckSquare size={20} />,
    },
  ];

  return (
    <div className={grid}>
      {cards.map((card, index) => (
        <StatCard key={card.title} {...card} delay={index * 0.05} />
      ))}
    </div>
  );
}
