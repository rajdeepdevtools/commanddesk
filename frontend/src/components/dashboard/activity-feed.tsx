"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  CheckSquare,
  FileText,
  Target,
  Activity as ActivityIcon,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  at: string;
  href: string;
}

function iconFor(id: string) {
  if (id.startsWith("project-")) return <Briefcase className="h-4 w-4" />;
  if (id.startsWith("task-")) return <CheckSquare className="h-4 w-4" />;
  if (id.startsWith("lead-")) return <Target className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function relativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

interface ActivityFeedProps {
  items?: ActivityItem[];
  isLoading?: boolean;
}

export function ActivityFeed({ items = [], isLoading }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-midnight-navy">
      <h3 className="mb-4 font-heading text-lg font-semibold text-midnight-navy dark:text-white">
        Company Recent Activity
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <ActivityIcon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-midnight-navy dark:text-white">
            No activity yet
          </p>
          <p className="max-w-xs text-xs text-gray-500 dark:text-gray-400">
            Projects, completed tasks, new leads and paid invoices will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-50 bg-gray-50/50 p-3 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-indigo focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
                    {iconFor(item.id)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-midnight-navy dark:text-white">
                      {item.action}
                    </span>
                    <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                      {item.detail}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  {relativeTime(item.at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
