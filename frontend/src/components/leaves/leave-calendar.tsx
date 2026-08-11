"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

export function LeaveCalendar({ leaves }: { leaves: any[] }) {
  const events = leaves?.map((leave) => ({
    id: leave.id,
    title: `${leave.user?.firstName || "Unknown"} - ${leave.type}`,
    start: leave.startDate,
    end: leave.endDate,
    backgroundColor: leave.status === "APPROVED" ? "#10b981" : leave.status === "REJECTED" ? "#ef4444" : "#f59e0b",
    borderColor: "transparent",
  })) || [];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        height="auto"
      />
    </div>
  );
}
