import React, { useState } from "react";
import { X, Receipt, IndianRupee, Tag, Calendar } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface ExpenseModalProps {
  onClose: () => void;
}

export function ExpenseModal({ onClose }: ExpenseModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Operations",
    date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const logExpense = useMutation({
    mutationFn: () => apiClient.post("/finance/expenses", {
      ...formData,
      amount: parseFloat(formData.amount),
    }),
    onSuccess: () => {
      toast.success("Expense logged successfully!");
      queryClient.invalidateQueries({ queryKey: ["finance-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to log expense");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast.error("Description and amount are required.");
      return;
    }
    logExpense.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-midnight-navy border border-gray-100 dark:border-gray-800 my-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-midnight-navy dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-500" />
            Log Expense
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AWS Hosting, Office Supplies"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-gray-400" />
                Amount *
              </label>
              <input
                type="number"
                required
                placeholder="5000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-gray-400" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="Operations">Operations</option>
                <option value="Software">Software & IT</option>
                <option value="Marketing">Marketing</option>
                <option value="Payroll">Payroll / Contractor</option>
                <option value="Travel">Travel</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              Expense Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Notes / Receipt Link
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Paste receipt URL or add notes..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={logExpense.isPending}
              className="flex-1 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
            >
              {logExpense.isPending ? "Logging..." : "Log Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
