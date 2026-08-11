"use client";

import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface HrmsCalendarProps {
  attendance: any[];
  leaves: any[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: any) => void;
}

export function HrmsCalendar({ attendance, leaves, onDateClick, onEventClick }: HrmsCalendarProps) {
  
  // Transform attendance and leaves into FullCalendar events
  const events = useMemo(() => {
    const combinedEvents: any[] = [];

    // Map Attendance
    attendance?.forEach((record) => {
      let color = "#10b981"; // PRESENT (Green)
      if (record.status === "ABSENT") color = "#ef4444"; // Red
      if (record.status === "LATE") color = "#f59e0b"; // Amber
      if (record.status === "HALF_DAY") color = "#3b82f6"; // Blue
      
      const userName = record.user ? `${record.user.firstName} ${record.user.lastName}` : "Employee";
      
      combinedEvents.push({
        id: `att_${record.id}`,
        title: `${userName} - ${record.status}`,
        start: record.date,
        allDay: true,
        backgroundColor: color,
        borderColor: color,
        extendedProps: { type: "attendance", data: record }
      });
    });

    // Map Leaves
    leaves?.forEach((leave) => {
      let color = "#8b5cf6"; // Default (Purple)
      let titlePrefix = "Leave";
      
      if (leave.status === "PENDING") {
        color = "#a78bfa"; // Light purple
        titlePrefix = "Pending Leave";
      } else if (leave.status === "APPROVED") {
        color = "#8b5cf6"; // Solid purple
        titlePrefix = "Approved Leave";
      } else {
        return; // Skip rejected/cancelled
      }

      const userName = leave.user ? `${leave.user.firstName} ${leave.user.lastName}` : "Employee";
      
      // We add 1 day to endDate because FullCalendar's end date is exclusive for all-day events
      const endDate = new Date(leave.endDate);
      endDate.setDate(endDate.getDate() + 1);

      combinedEvents.push({
        id: `leave_${leave.id}`,
        title: `${userName} - ${titlePrefix}`,
        start: leave.startDate,
        end: endDate,
        allDay: true,
        backgroundColor: color,
        borderColor: color,
        extendedProps: { type: "leave", data: leave }
      });
    });

    return combinedEvents;
  }, [attendance, leaves]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          height="auto"
          dateClick={(info) => {
            if (onDateClick) onDateClick(info.date);
          }}
          eventClick={(info) => {
            if (onEventClick) onEventClick(info.event.extendedProps);
          }}
          eventContent={(arg) => {
            return (
              <div className="px-1.5 py-0.5 text-xs font-medium truncate">
                {arg.event.title}
              </div>
            );
          }}
        />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .calendar-container .fc-theme-standard td, .calendar-container .fc-theme-standard th {
          border-color: rgba(229, 231, 235, 0.5) !important;
        }
        .dark .calendar-container .fc-theme-standard td, .dark .calendar-container .fc-theme-standard th {
          border-color: rgba(75, 85, 99, 0.4) !important;
        }
        .calendar-container .fc-button-primary {
          background-color: #6366f1 !important;
          border-color: #6366f1 !important;
          border-radius: 0.5rem;
          padding: 0.375rem 0.75rem;
          font-weight: 500;
          font-size: 0.875rem;
          text-transform: capitalize;
        }
        .calendar-container .fc-button-primary:hover {
          background-color: #4f46e5 !important;
        }
        .calendar-container .fc-button-primary:not(:disabled).fc-button-active, 
        .calendar-container .fc-button-primary:not(:disabled):active {
          background-color: #4338ca !important;
        }
        .calendar-container .fc-day-today {
          background-color: rgba(99, 102, 241, 0.05) !important;
        }
        .dark .calendar-container .fc-day-today {
          background-color: rgba(99, 102, 241, 0.1) !important;
        }
        .calendar-container .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          font-family: inherit !important;
        }
        .dark .calendar-container .fc-col-header-cell-cushion, 
        .dark .calendar-container .fc-daygrid-day-number {
          color: #d1d5db;
        }
      `}} />
    </div>
  );
}
