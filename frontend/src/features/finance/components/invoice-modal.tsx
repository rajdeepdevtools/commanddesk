import React, { useState } from "react";
import { X, FileText, IndianRupee, Building, Calendar } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface InvoiceModalProps {
  onClose: () => void;
}

export function InvoiceModal({ onClose }: InvoiceModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    clientId: "",
    amount: "",
    tax: "",
    dueDate: "",
    notes: "",
  });

  // Fetch clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["crm-clients"],
    queryFn: () => apiClient.get("/crm/clients").then((res) => res.data),
  });

  const createInvoice = useMutation({
    mutationFn: () => apiClient.post("/finance/invoices", {
      ...formData,
      amount: parseFloat(formData.amount),
      tax: formData.tax ? parseFloat(formData.tax) : 0,
    }),
    onSuccess: () => {
      toast.success("Invoice created successfully!");
      queryClient.invalidateQueries({ queryKey: ["finance-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["finance-stats"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create invoice");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) {
      toast.error("Amount is required.");
      return;
    }
    createInvoice.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-midnight-navy border border-gray-100 dark:border-gray-800 my-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-midnight-navy dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-indigo" />
            Create Invoice
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-gray-400" />
              Select Client
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">-- No Client (Internal / Cash) --</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-gray-400" />
                Base Amount
              </label>
              <input
                type="number"
                required
                placeholder="50000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-gray-400" />
                Tax Amount (Optional)
              </label>
              <input
                type="number"
                placeholder="9000"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Payment terms, bank details, etc..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-indigo focus:ring-4 focus:ring-primary-indigo/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
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
              disabled={createInvoice.isPending}
              className="flex-1 rounded-xl bg-primary-indigo px-4 py-2 text-sm font-semibold text-white hover:bg-primary-indigo/90 disabled:opacity-50 transition-colors"
            >
              {createInvoice.isPending ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
