"use client";

import React, { useState, useEffect } from "react";
import { Clock, Play, Square, Coffee } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export function ClockInWidget() {
  const queryClient = useQueryClient();
  const [time, setTime] = useState(new Date());
  
  // In a real app, we would fetch the current user's today attendance record
  // to see if they are already clocked in. For now, we mock it via state.
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clockInMutation = useMutation({
    mutationFn: () => apiClient.post("/hrms/attendance", {}),
    onSuccess: (res) => {
      setIsClockedIn(true);
      setClockInTime(new Date());
      toast.success("Clocked in successfully!");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to clock in");
    }
  });

  const clockOutMutation = useMutation({
    mutationFn: () => apiClient.patch("/hrms/attendance", {}),
    onSuccess: () => {
      setIsClockedIn(false);
      setClockInTime(null);
      toast.success("Clocked out successfully!");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to clock out");
    }
  });

  const formatElapsedTime = () => {
    if (!clockInTime) return "00:00:00";
    const diff = time.getTime() - clockInTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-midnight-navy dark:text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-indigo" />
          Time Tracker
        </h3>
        <div className="text-sm font-medium text-gray-500">
          {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <div className="text-5xl font-bold font-mono tracking-wider text-midnight-navy dark:text-white mb-2">
          {isClockedIn ? formatElapsedTime() : time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isClockedIn ? "Current Session" : "Local Time"}
        </p>
      </div>

      <div className="mt-4 flex gap-3">
        {!isClockedIn ? (
          <button
            onClick={() => clockInMutation.mutate()}
            disabled={clockInMutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-current" />
            Clock In
          </button>
        ) : (
          <button
            onClick={() => clockOutMutation.mutate()}
            disabled={clockOutMutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-50"
          >
            <Square className="h-4 w-4 fill-current" />
            Clock Out
          </button>
        )}
      </div>
    </div>
  );
}
