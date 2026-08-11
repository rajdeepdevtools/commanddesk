"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import { UploadDocumentModal } from "@/features/documents/components/upload-document-modal";
import { 
  FileText, Folder, Plus, Search, Globe, Lock, MoreVertical, 
  Download, Trash2, Shield, FolderOpen, Image as ImageIcon,
  FileSpreadsheet, FileIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const FOLDERS = [
  { id: "All", name: "All Files", icon: FolderOpen },
  { id: "General", name: "General", icon: Folder },
  { id: "HR Policies", name: "HR Policies", icon: Shield },
  { id: "Legal & Contracts", name: "Legal & Contracts", icon: FileText },
  { id: "Design Assets", name: "Design Assets", icon: ImageIcon },
  { id: "Personal", name: "Personal Vault", icon: Lock },
];

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeFolder, setActiveFolder] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => apiClient.get("/documents").then((res) => res.data),
  });

  const deleteDoc = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/documents/${id}`),
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => toast.error("Failed to delete or unauthorized")
  });

  const filteredDocs = documents.filter((doc: any) => {
    const matchesFolder = activeFolder === "All" || doc.folder === activeFolder;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="w-10 h-10 text-rose-500" />;
    if (fileType.includes("image")) return <ImageIcon className="w-10 h-10 text-emerald-500" />;
    if (fileType.includes("sheet") || fileType.includes("csv")) return <FileSpreadsheet className="w-10 h-10 text-green-600" />;
    return <FileIcon className="w-10 h-10 text-indigo-500" />;
  };

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-midnight-navy dark:text-white flex items-center gap-3">
              File Vault
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Securely store and share company documents.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search files..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-midnight-navy border border-gray-200 dark:border-gray-800 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 w-64 shadow-sm"
              />
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 h-[calc(100vh-180px)]">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-2">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">Folders</h3>
            {FOLDERS.map(folder => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                  {folder.name}
                </button>
              );
            })}
          </div>

          {/* Main Content Area - Grid */}
          <div className="flex-1 bg-white dark:bg-midnight-navy border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {activeFolder} {searchQuery && ` - Search: "${searchQuery}"`}
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-gray-500">Loading documents...</div>
            ) : filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">No files found</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  {searchQuery ? "Try a different search term." : "Upload a document to this folder to get started."}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
                  >
                    Upload your first file
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocs.map((doc: any) => (
                  <div key={doc.id} className="group relative bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50">
                    
                    {/* Public/Private Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      {doc.isPublic ? (
                        <div className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 p-1.5 rounded-md" title="Public (Company-wide)">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 p-1.5 rounded-md" title="Private">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button className="bg-white dark:bg-gray-800 p-1.5 rounded-md text-gray-600 hover:text-indigo-600 shadow-sm border border-gray-200 dark:border-gray-700">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this document?")) {
                            deleteDoc.mutate(doc.id);
                          }
                        }}
                        className="bg-white dark:bg-gray-800 p-1.5 rounded-md text-gray-600 hover:text-rose-600 shadow-sm border border-gray-200 dark:border-gray-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-col items-center text-center mt-6">
                      <div className="bg-white dark:bg-midnight-navy w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800 mb-4 group-hover:-translate-y-1 transition-transform">
                        {getFileIcon(doc.fileType || "")}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 w-full" title={doc.name}>
                        {doc.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 w-full">
                        {doc.description || `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                      
                      <div className="w-full border-t border-gray-200 dark:border-gray-800 mt-4 pt-3 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5 truncate">
                          <img src={doc.uploader?.avatarUrl || `https://ui-avatars.com/api/?name=${doc.uploader?.firstName}+${doc.uploader?.lastName}&background=6366f1&color=fff`} className="w-4 h-4 rounded-full" />
                          <span className="truncate">{doc.uploader?.firstName}</span>
                        </div>
                        <span>{formatDistanceToNow(new Date(doc.createdAt))} ago</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadModal && <UploadDocumentModal onClose={() => setShowUploadModal(false)} />}
    </DashboardLayout>
  );
}
