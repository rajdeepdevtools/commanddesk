import React, { useState } from "react";
import { X, UploadCloud, Folder, FileText, Globe, Lock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface UploadDocumentModalProps {
  onClose: () => void;
}

export function UploadDocumentModal({ onClose }: UploadDocumentModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    folder: "General",
    isPublic: false,
  });

  const uploadDoc = useMutation({
    mutationFn: () => apiClient.post("/documents", formData),
    onSuccess: () => {
      toast.success("Document uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to upload document");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("File name is required.");
      return;
    }
    // Mock upload delay for UX
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)).then(() => uploadDoc.mutateAsync()),
      {
        loading: "Uploading file securely to vault...",
        success: "Upload complete!",
        error: "Upload failed."
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-midnight-navy border border-gray-100 dark:border-gray-800 my-8 animate-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-midnight-navy dark:text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-500" />
            Upload to Vault
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mock File Dropzone */}
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to browse or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">PDF, DOCX, PNG, JPG up to 10MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-gray-400" />
              Document Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Q3 Financial Report.pdf"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-gray-400" />
                Folder
              </label>
              <select
                value={formData.folder}
                onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white transition-all"
              >
                <option value="General">General</option>
                <option value="HR Policies">HR Policies</option>
                <option value="Legal & Contracts">Legal & Contracts</option>
                <option value="Design Assets">Design Assets</option>
                <option value="Personal">Personal Vault</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
                {formData.isPublic ? <Globe className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-rose-500" />}
                Visibility
              </label>
              <div 
                className={`w-full rounded-xl border px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-all select-none
                  ${formData.isPublic 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' 
                    : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'}`}
                onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
              >
                <span className="font-medium">{formData.isPublic ? "Company Public" : "Private (Only Me)"}</span>
                <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${formData.isPublic ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${formData.isPublic ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Add some context about this file..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white transition-all"
            />
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
              disabled={uploadDoc.isPending}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
