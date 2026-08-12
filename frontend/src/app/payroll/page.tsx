"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import { GeneratePayrollModal } from "@/features/payroll/components/generate-payroll-modal";
import { PayslipPDF } from "@/features/payroll/components/payslip-pdf";
import { IndianRupee, FileText, Receipt, Plus, Download, Calculator, CheckCircle2, Calendar } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";

export default function PayrollPage() {
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ["payroll-history"],
    queryFn: () => apiClient.get("/payroll").then((res) => res.data),
  });

  const totalPayrollThisMonth = payrolls
    .filter((p: any) => p.month === new Date().getMonth() + 1 && p.year === new Date().getFullYear())
    .reduce((sum: number, p: any) => sum + p.netSalary, 0);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white flex items-center gap-3">
              Payroll
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Generate payroll and distribute payslips.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-700 shadow-sm"
            >
              <Calculator className="h-4 w-4" />
              Run Payroll
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-midnight-navy">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Processed (This Month)</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{totalPayrollThisMonth.toLocaleString()}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-midnight-navy overflow-hidden">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Period</th>
                <th className="px-6 py-4 font-semibold">Earnings</th>
                <th className="px-6 py-4 font-semibold">Deductions</th>
                <th className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">Net Salary</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">Loading payroll data...</td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">No payroll generated yet. Click "Run Payroll" to start.</td>
                </tr>
              ) : (
                payrolls.map((payroll: any) => {
                  const earnings = payroll.basicSalary + (payroll.hra || 0) + (payroll.da || 0) + (payroll.bonus || 0);
                  const deductions = (payroll.tax || 0) + (payroll.pf || 0) + (payroll.esi || 0) + (payroll.deductions || 0);

                  return (
                    <tr key={payroll.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {payroll.user.firstName} {payroll.user.lastName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {payroll.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold dark:bg-gray-800 dark:text-gray-300">
                          <Calendar className="w-3 h-3" />
                          {months[payroll.month - 1]} {payroll.year}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        ₹{earnings.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-rose-500">
                        -₹{deductions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-base">
                        ₹{payroll.netSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <PDFDownloadLink
                          document={<PayslipPDF payroll={payroll} />}
                          fileName={`Payslip-${payroll.user.firstName}-${months[payroll.month - 1]}-${payroll.year}.pdf`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors"
                        >
                          {/* @ts-ignore */}
                          {({ loading }) => (
                            <>
                              <Download className="h-3.5 w-3.5" />
                              {loading ? "Preparing..." : "Download"}
                            </>
                          )}
                        </PDFDownloadLink>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showGenerateModal && (
        <GeneratePayrollModal onClose={() => setShowGenerateModal(false)} />
      )}
    </DashboardLayout>
  );
}
