import React, { useState } from "react";
import { X, Globe, LayoutTemplate } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface CreateSiteModalProps {
  onClose: () => void;
}

export function CreateSiteModal({ onClose }: CreateSiteModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    template: "blank",
  });

  const createSite = useMutation({
    mutationFn: () => apiClient.post("/websites", formData),
    onSuccess: () => {
      toast.success("Website project created successfully!");
      queryClient.invalidateQueries({ queryKey: ["websites"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create website");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Site name is required.");
      return;
    }
    createSite.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-midnight-navy border border-gray-100 dark:border-gray-800 my-8 animate-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-midnight-navy dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Create New Portal
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Portal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Careers Portal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Custom Domain (Optional)
            </label>
            <div className="flex rounded-xl shadow-sm">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 text-gray-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                https://
              </span>
              <input
                type="text"
                placeholder="careers.yourcompany.com"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="block w-full min-w-0 flex-1 rounded-none rounded-r-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
              <LayoutTemplate className="w-4 h-4 text-gray-400" />
              Starting Template
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setFormData({ ...formData, template: 'blank' })}
                className={`border rounded-xl p-3 cursor-pointer transition-all ${formData.template === 'blank' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700'}`}
              >
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Blank Site</div>
                <p className="text-xs text-gray-500 mt-1">Start from scratch</p>
              </div>
              <div 
                onClick={() => setFormData({ ...formData, template: 'marketing' })}
                className={`border rounded-xl p-3 cursor-pointer transition-all ${formData.template === 'marketing' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700'}`}
              >
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Marketing</div>
                <p className="text-xs text-gray-500 mt-1">Landing page blocks</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSite.isPending}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              Create Portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
