"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useState } from "react";
import { Search, Plus, Briefcase, Users, UserCheck } from "lucide-react";

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "applicants">("jobs");

  // Mock data for UI demonstration until API is connected
  const jobs = [
    { id: "1", title: "Senior Software Engineer", department: "Engineering", type: "Full-Time", location: "Remote", applicants: 12, status: "OPEN" },
    { id: "2", title: "Product Marketing Manager", department: "Marketing", type: "Full-Time", location: "New York", applicants: 5, status: "OPEN" },
    { id: "3", title: "Customer Success Rep", department: "Support", type: "Contract", location: "London", applicants: 28, status: "CLOSED" }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">Recruitment (ATS)</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage job postings, applicants, and interviews.</p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Open Positions</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">8</h3>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Applicants</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">142</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Interviews Scheduled</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12</h3>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-6">
            <button 
              onClick={() => setActiveTab("jobs")}
              className={`font-medium pb-4 -mb-4 border-b-2 transition-colors \${activeTab === "jobs" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"}`}
            >
              Job Postings
            </button>
            <button 
              onClick={() => setActiveTab("applicants")}
              className={`font-medium pb-4 -mb-4 border-b-2 transition-colors \${activeTab === "applicants" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"}`}
            >
              Applicants Pipeline
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === "jobs" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Job Title</th>
                      <th className="px-6 py-4 font-semibold">Department</th>
                      <th className="px-6 py-4 font-semibold">Type & Location</th>
                      <th className="px-6 py-4 font-semibold">Applicants</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {jobs.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{job.title}</td>
                        <td className="px-6 py-4">{job.department}</td>
                        <td className="px-6 py-4">{job.type} • {job.location}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs">
                            {job.applicants}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold \${job.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <p>Kanban Board for Applicants will be rendered here.</p>
                <p className="text-sm mt-2">Connects to `Applicant` and `Interview` models.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
