"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import { ClockInWidget } from "@/features/hrms/components/clock-in-widget";
import { LeaveRequestModal } from "@/features/hrms/components/leave-request-modal";
import { HrmsCalendar } from "@/features/hrms/components/hrms-calendar";
import { Users, Calendar as CalendarIcon, Briefcase, Plus } from "lucide-react";

export default function HrmsPage() {
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Fetch Attendance
  const { data: attendance = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => apiClient.get("/hrms/attendance").then((res) => res.data),
  });

  // Fetch Leaves
  const { data: leaves = [], isLoading: isLoadingLeaves } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => apiClient.get("/hrms/leaves").then((res) => res.data),
  });

  const activeLeaves = leaves.filter((l: any) => l.status === "APPROVED").length;
  const pendingLeaves = leaves.filter((l: any) => l.status === "PENDING").length;
  
  // Calculate today's attendance for stats
  const today = new Date().setHours(0,0,0,0);
  const presentToday = attendance.filter((a: any) => new Date(a.date).getTime() === today && a.status === "PRESENT").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white">
              HR & Attendance
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage attendance, time tracking, and leave requests.
            </p>
          </div>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-indigo/90"
          >
            <Plus className="h-4 w-4" />
            Request Leave
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          
          {/* Left Sidebar (Widgets & Stats) */}
          <div className="space-y-6 lg:col-span-1">
            <ClockInWidget />
            
            {/* Quick Stats */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
              <h3 className="mb-4 font-heading text-sm font-semibold text-gray-900 dark:text-white">
                Today's Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{presentToday}</p>
                    <p className="text-xs font-medium text-gray-500">Clocked In</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeLeaves}</p>
                    <p className="text-xs font-medium text-gray-500">On Leave</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingLeaves}</p>
                    <p className="text-xs font-medium text-gray-500">Pending Requests</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Calendar View */}
          <div className="lg:col-span-3">
            {(isLoadingAttendance || isLoadingLeaves) ? (
              <div className="flex h-96 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-indigo border-t-transparent"></div>
              </div>
            ) : (
              <HrmsCalendar attendance={attendance} leaves={leaves} />
            )}
          </div>
        </div>
      </div>

      {showLeaveModal && (
        <LeaveRequestModal onClose={() => setShowLeaveModal(false)} />
      )}
    </DashboardLayout>
  );
}
