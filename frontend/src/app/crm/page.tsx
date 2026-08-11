"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import { SalesPipeline } from "@/features/crm/components/sales-pipeline";
import { LeadModal } from "@/features/crm/components/lead-modal";
import { Users, Briefcase, Plus, Search, Kanban, List, Building } from "lucide-react";

export default function CrmPage() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "leads" | "clients">("pipeline");
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Fetch Leads
  const { data: leads = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ["crm-leads"],
    queryFn: () => apiClient.get("/crm/leads").then((res) => res.data),
  });

  // Fetch Clients
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["crm-clients"],
    queryFn: () => apiClient.get("/crm/clients").then((res) => res.data),
  });

  const totalPipelineValue = leads
    .filter((l: any) => l.status !== "WON" && l.status !== "LOST")
    .reduce((sum: number, l: any) => sum + (l.budget || 0), 0);

  const activeLeadsCount = leads.filter((l: any) => l.status !== "WON" && l.status !== "LOST").length;
  const wonLeadsCount = leads.filter((l: any) => l.status === "WON").length;

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white">
              CRM & Sales
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your sales pipeline, track leads, and view clients.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeadModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-indigo/90"
            >
              <Plus className="h-4 w-4" />
              New Lead
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-midnight-navy flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pipeline Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{totalPipelineValue.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-midnight-navy flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Leads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeLeadsCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-midnight-navy flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Deals Won</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{wonLeadsCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20 flex items-center justify-center">
              <Building className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "pipeline"
                ? "border-primary-indigo text-primary-indigo"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Kanban className="h-4 w-4" />
            Sales Pipeline
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "leads"
                ? "border-primary-indigo text-primary-indigo"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <List className="h-4 w-4" />
            All Leads
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "clients"
                ? "border-primary-indigo text-primary-indigo"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Building className="h-4 w-4" />
            Clients Directory
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === "pipeline" && (
            isLoadingLeads ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-indigo border-t-transparent"></div>
              </div>
            ) : (
              <SalesPipeline leads={leads} />
            )
          )}

          {activeTab === "leads" && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-midnight-navy overflow-hidden">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Lead Name</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Budget</th>
                    <th className="px-6 py-4">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {lead.name}
                        <div className="text-xs text-gray-500 mt-1">{lead.source}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{lead.email}</div>
                        <div className="text-xs text-gray-400">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {lead.budget ? `₹${lead.budget.toLocaleString()}` : "-"}
                      </td>
                      <td className="px-6 py-4">{lead.score || "-"}</td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8">No leads found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "clients" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client: any) => (
                <div key={client.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary-indigo/10 flex items-center justify-center text-primary-indigo font-bold">
                      {client.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{client.companyName || client.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{client.email}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">{client._count?.invoices || 0}</span> Invoices
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">{client._count?.leads || 0}</span> Past Deals
                    </div>
                  </div>
                </div>
              ))}
              {clients.length === 0 && !isLoadingClients && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  No clients yet. Drag a lead to "Closed Won" to convert them to a client.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showLeadModal && (
        <LeadModal onClose={() => setShowLeadModal(false)} />
      )}
    </DashboardLayout>
  );
}
