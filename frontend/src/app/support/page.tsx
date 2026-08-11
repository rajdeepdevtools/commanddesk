"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import { CreateTicketModal } from "@/features/support/components/create-ticket-modal";
import { TicketDrawer } from "@/features/support/components/ticket-drawer";
import { HelpCircle, Plus, Search, Filter, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SupportPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: () => apiClient.get("/support/tickets").then((res) => res.data),
  });

  const filteredTickets = filterStatus === "ALL" 
    ? tickets 
    : tickets.filter((t: any) => t.status === filterStatus);

  const stats = {
    open: tickets.filter((t: any) => t.status === "OPEN").length,
    inProgress: tickets.filter((t: any) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t: any) => t.status === "RESOLVED").length,
  };

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white flex items-center gap-3">
              Helpdesk
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Submit and track support requests.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-midnight-navy border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setFilterStatus("OPEN")}>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Open Tickets</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.open}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white dark:bg-midnight-navy border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-amber-500 transition-colors" onClick={() => setFilterStatus("IN_PROGRESS")}>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">In Progress</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.inProgress}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white dark:bg-midnight-navy border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors" onClick={() => setFilterStatus("RESOLVED")}>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Resolved</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.resolved}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="flex-1 bg-white dark:bg-midnight-navy border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-white dark:bg-midnight-navy text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold">Requester</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-8">Loading tickets...</td></tr>
                ) : filteredTickets.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-500">No tickets found.</td></tr>
                ) : (
                  filteredTickets.map((ticket: any) => (
                    <tr 
                      key={ticket.id} 
                      onClick={() => setSelectedTicket(ticket)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {ticket.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs mt-0.5">
                          {ticket.category}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold uppercase">
                            {ticket.createdBy?.firstName?.[0]}{ticket.createdBy?.lastName?.[0]}
                          </div>
                          <span>{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${ticket.priority === 'URGENT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border
                          ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400' :
                            ticket.status === 'IN_PROGRESS' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-400' :
                            'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && <CreateTicketModal onClose={() => setShowCreateModal(false)} />}
      
      {selectedTicket && (
        <TicketDrawer 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}
    </DashboardLayout>
  );
}
