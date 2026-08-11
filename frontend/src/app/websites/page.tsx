"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import { CreateSiteModal } from "@/features/websites/components/create-site-modal";
import { Plus, Globe, Settings, FileText, ArrowRight, Activity, Users } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function WebsitesDashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ["websites"],
    queryFn: () => apiClient.get("/websites").then((res) => res.data),
  });

  const totalVisitors = sites.reduce((sum: number, site: any) => sum + (site.visitors || 0), 0);

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white flex items-center gap-3">
              Websites & Portals
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your company's external sites and internal CMS.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Portal
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sites</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{sites.length}</h3>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Visitors (30d)</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{(totalVisitors / 1000).toFixed(1)}k</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Sites Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Portals</h2>
          {isLoading ? (
            <div className="flex justify-center py-12 text-gray-500">Loading your sites...</div>
          ) : sites.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white dark:bg-midnight-navy border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-sm">
              <Globe className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No portals yet</h3>
              <p className="text-gray-500 mt-1 mb-6 max-w-sm">Create your first landing page, careers site, or customer help center to get started.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-700 shadow-sm"
              >
                Create First Portal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.map((site: any) => (
                <div key={site.id} className="group bg-white dark:bg-midnight-navy border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Globe className="w-6 h-6" />
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full border ${site.status === 'LIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'}`}>
                        {site.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">{site.name}</h3>
                    <a href={`https://${site.domain}`} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline truncate block">
                      {site.domain}
                    </a>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/20 flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FileText className="w-3 h-3"/> Pages</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{site.pagesCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Visitors</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{(site.visitors / 1000).toFixed(1)}k</p>
                    </div>
                  </div>

                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400">
                      {site.lastPublished ? `Updated ${formatDistanceToNow(new Date(site.lastPublished))} ago` : 'Never published'}
                    </p>
                    <Link href={`/websites/${site.id}`}>
                      <button className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 group-hover:translate-x-1 transition-transform">
                        Builder <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && <CreateSiteModal onClose={() => setShowCreateModal(false)} />}
    </DashboardLayout>
  );
}
