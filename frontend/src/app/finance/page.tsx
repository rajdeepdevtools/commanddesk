"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import { InvoiceModal } from "@/features/finance/components/invoice-modal";
import { ExpenseModal } from "@/features/finance/components/expense-modal";
import { IndianRupee, FileText, Receipt, Plus, TrendingUp, TrendingDown, Clock, Download } from "lucide-react";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "invoices" | "expenses">("dashboard");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Fetch Stats
  const { data: stats = { totalRevenue: 0, pendingRevenue: 0, totalExpenses: 0, netProfit: 0 }, isLoading: isLoadingStats } = useQuery({
    queryKey: ["finance-stats"],
    queryFn: () => apiClient.get("/finance/stats").then((res) => res.data),
  });

  // Fetch Invoices
  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["finance-invoices"],
    queryFn: () => apiClient.get("/finance/invoices").then((res) => res.data),
  });

  // Fetch Expenses
  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["finance-expenses"],
    queryFn: () => apiClient.get("/finance/expenses").then((res) => res.data),
  });

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white">
              Finance
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage invoices, track expenses, and view financial reports.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:bg-midnight-navy dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 text-rose-500" />
              Log Expense
            </button>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-indigo/90"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "dashboard"
                ? "border-primary-indigo text-primary-indigo"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "invoices"
                ? "border-primary-indigo text-primary-indigo"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <FileText className="h-4 w-4" />
            Invoices
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "expenses"
                ? "border-primary-indigo text-primary-indigo"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Expenses
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <IndianRupee className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{stats.totalRevenue.toLocaleString()}</h3>
                  </div>
                </div>
              </div>

              {/* Pending Revenue */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Invoices</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{stats.pendingRevenue.toLocaleString()}</h3>
                  </div>
                </div>
              </div>

              {/* Total Expenses */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                    <TrendingDown className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{stats.totalExpenses.toLocaleString()}</h3>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit</p>
                    <h3 className={`text-2xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      ₹{stats.netProfit.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-midnight-navy overflow-hidden">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Invoice No.</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        {inv.client ? (inv.client.companyName || inv.client.name) : "Internal / Cash"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          inv.status === "PAID" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          inv.status === "DRAFT" ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" :
                          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                        ₹{inv.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && !isLoadingInvoices && (
                    <tr>
                      <td colSpan={5} className="text-center py-8">No invoices generated yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-midnight-navy overflow-hidden">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {expenses.map((exp: any) => (
                    <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {exp.description}
                        {exp.notes && <div className="text-xs text-gray-500 font-normal mt-0.5">{exp.notes}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {exp.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-rose-600 dark:text-rose-400">
                        -₹{exp.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && !isLoadingExpenses && (
                    <tr>
                      <td colSpan={4} className="text-center py-8">No expenses logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showInvoiceModal && (
        <InvoiceModal onClose={() => setShowInvoiceModal(false)} />
      )}
      
      {showExpenseModal && (
        <ExpenseModal onClose={() => setShowExpenseModal(false)} />
      )}
    </DashboardLayout>
  );
}
