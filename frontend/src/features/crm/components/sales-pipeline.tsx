"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Phone, Mail, User, Building, IndianRupee, Trophy, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const PIPELINE_COLUMNS = [
  { id: "NEW", title: "New Lead", color: "bg-blue-50 dark:bg-blue-900/20", borderColor: "border-blue-200 dark:border-blue-800" },
  { id: "CONTACTED", title: "Contacted", color: "bg-purple-50 dark:bg-purple-900/20", borderColor: "border-purple-200 dark:border-purple-800" },
  { id: "QUALIFIED", title: "Qualified", color: "bg-indigo-50 dark:bg-indigo-900/20", borderColor: "border-indigo-200 dark:border-indigo-800" },
  { id: "PROPOSAL", title: "Proposal", color: "bg-amber-50 dark:bg-amber-900/20", borderColor: "border-amber-200 dark:border-amber-800" },
  { id: "NEGOTIATION", title: "Negotiation", color: "bg-orange-50 dark:bg-orange-900/20", borderColor: "border-orange-200 dark:border-orange-800" },
  { id: "WON", title: "Closed Won", color: "bg-emerald-50 dark:bg-emerald-900/20", borderColor: "border-emerald-200 dark:border-emerald-800" },
  { id: "LOST", title: "Closed Lost", color: "bg-rose-50 dark:bg-rose-900/20", borderColor: "border-rose-200 dark:border-rose-800" },
];

interface SalesPipelineProps {
  leads: any[];
}

export function SalesPipeline({ leads: initialLeads }: SalesPipelineProps) {
  const queryClient = useQueryClient();
  const [leads, setLeads] = useState(initialLeads);
  const [activeLead, setActiveLead] = useState<any | null>(null);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const updateLead = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: string }) =>
      apiClient.patch(`/crm/leads/${leadId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
    },
    onError: () => {
      toast.error("Failed to update lead status");
    }
  });

  const convertToClient = useMutation({
    mutationFn: (leadId: string) =>
      apiClient.patch(`/crm/leads/${leadId}`, { action: "CONVERT_TO_CLIENT" }),
    onSuccess: (res) => {
      toast.success(`Lead successfully converted to Client: ${res.data.name}!`);
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      queryClient.invalidateQueries({ queryKey: ["crm-clients"] });
    },
    onError: () => {
      toast.error("Failed to convert lead to client.");
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getLeadsByStatus = (status: string) => {
    return leads.filter((l: any) => l.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find((l) => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveALead = active.data.current?.type === "Lead";
    const isOverALead = over.data.current?.type === "Lead";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveALead) return;

    setLeads((currentLeads) => {
      const activeIndex = currentLeads.findIndex((l) => l.id === activeId);
      const activeItem = currentLeads[activeIndex];

      if (isOverALead) {
        const overIndex = currentLeads.findIndex((l) => l.id === overId);
        const overItem = currentLeads[overIndex];
        
        if (activeItem.status !== overItem.status) {
          return [
            ...currentLeads.slice(0, activeIndex),
            { ...activeItem, status: overItem.status },
            ...currentLeads.slice(activeIndex + 1),
          ];
        }
        return arrayMove(currentLeads, activeIndex, overIndex);
      }

      if (isOverAColumn) {
        if (activeItem.status !== overId) {
          return [
            ...currentLeads.slice(0, activeIndex),
            { ...activeItem, status: overId as string },
            ...currentLeads.slice(activeIndex + 1),
          ];
        }
      }

      return currentLeads;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeIndex = leads.findIndex((l) => l.id === activeId);
    const lead = leads[activeIndex];
    
    let targetStatus = lead.status;
    const isOverALead = over.data.current?.type === "Lead";
    
    if (isOverALead) {
      const overIndex = leads.findIndex((l) => l.id === overId);
      targetStatus = leads[overIndex].status;
    } else if (over.data.current?.type === "Column") {
      targetStatus = over.id as string;
    }

    // Trigger update
    updateLead.mutate({ leadId: lead.id, status: targetStatus });

    // If moved to WON, trigger conversion prompt
    if (targetStatus === "WON" && activeTask?.status !== "WON") {
      if (confirm(`Convert ${lead.name} to a Client?`)) {
        convertToClient.mutate(lead.id);
      }
    }
  };

  // Safe fallback for activeTask check
  const activeTask = activeLead;

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-1 overflow-x-auto pb-4 gap-6 custom-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {PIPELINE_COLUMNS.map((col) => {
          const columnLeads = getLeadsByStatus(col.id);
          const totalValue = columnLeads.reduce((sum, l) => sum + (l.budget || 0), 0);
          return (
            <PipelineColumn 
              key={col.id} 
              column={col} 
              leads={columnLeads} 
              totalValue={totalValue} 
            />
          );
        })}
        
        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function PipelineColumn({ column, leads, totalValue }: { column: any; leads: any[]; totalValue: number }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "Column" },
  });

  return (
    <div className={`flex w-80 shrink-0 flex-col rounded-2xl p-3 border ${column.borderColor} bg-gray-50/30 dark:bg-gray-900/30`}>
      <div className={`mb-4 flex flex-col p-3 rounded-xl ${column.color}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-heading font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {column.id === "WON" && <Trophy className="w-4 h-4 text-emerald-600" />}
            {column.title}
          </h3>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/60 px-2 text-xs font-bold text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
            {leads.length}
          </span>
        </div>
        {totalValue > 0 && (
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
            ₹{totalValue.toLocaleString()}
          </div>
        )}
      </div>

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-3 min-h-[200px] overflow-y-auto custom-scrollbar pr-1">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <SortableLead key={lead.id} lead={lead} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-transparent dark:border-gray-700/50">
            <span className="text-sm font-medium text-gray-400">Empty</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableLead({ lead }: { lead: any }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: "Lead", lead },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} />
    </div>
  );
}

function LeadCard({ lead, isOverlay }: { lead: any; isOverlay?: boolean }) {
  return (
    <div className={`group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all dark:border-gray-700 dark:bg-midnight-navy ${isOverlay ? 'scale-105 shadow-xl rotate-3 opacity-95 ring-2 ring-primary-indigo' : 'hover:border-primary-indigo/30 hover:shadow-md'}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-heading text-sm font-bold text-gray-900 dark:text-white truncate pr-2">
          {lead.name}
        </h4>
        {lead.score > 0 && (
          <span className={`flex shrink-0 items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
            lead.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
            lead.score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {lead.score}
          </span>
        )}
      </div>
      
      {lead.budget && (
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          <IndianRupee className="h-3.5 w-3.5 text-gray-400" />
          {lead.budget.toLocaleString()}
        </div>
      )}

      <div className="space-y-1.5 border-t border-gray-50 pt-3 dark:border-gray-800">
        {lead.email && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Phone className="h-3 w-3 shrink-0" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
