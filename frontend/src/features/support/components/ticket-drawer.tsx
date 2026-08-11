import React, { useState } from "react";
import { X, Send, User, Clock, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface TicketDrawerProps {
  ticket: any;
  onClose: () => void;
}

export function TicketDrawer({ ticket, onClose }: TicketDrawerProps) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [status, setStatus] = useState(ticket.status);
  
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["support-ticket-comments", ticket.id],
    queryFn: () => apiClient.get(`/support/tickets/${ticket.id}/comments`).then(res => res.data),
  });

  const addComment = useMutation({
    mutationFn: () => apiClient.post(`/support/tickets/${ticket.id}/comments`, { content: newComment }),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["support-ticket-comments", ticket.id] });
    },
    onError: () => toast.error("Failed to add comment")
  });

  const updateStatus = useMutation({
    mutationFn: (newStatus: string) => apiClient.patch(`/support/tickets/${ticket.id}`, { status: newStatus }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: () => {
      toast.error("Failed to update status");
      setStatus(ticket.status); // revert on error
    }
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatus(val);
    updateStatus.mutate(val);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-white dark:bg-midnight-navy shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="font-semibold text-gray-900 dark:text-white truncate pr-4">
            {ticket.title}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Details */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <span>{ticket.createdBy?.firstName} {ticket.createdBy?.lastName}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={handleStatusChange}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            
            <div className={`px-2 py-1 text-xs font-semibold rounded-lg flex items-center gap-1
              ${ticket.priority === 'URGENT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
              <AlertCircle className="w-3 h-3" />
              {ticket.priority}
            </div>
            <div className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg dark:bg-gray-800 dark:text-gray-300">
              {ticket.category || 'General'}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">
            {ticket.description}
          </div>
        </div>

        {/* Comments Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-[#0b1121]">
          {isLoading ? (
            <div className="text-center text-sm text-gray-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-sm text-gray-500 mt-10">No comments yet.</div>
          ) : (
            comments.map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase">
                  {c.author?.firstName?.[0]}{c.author?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <div className="bg-white dark:bg-midnight-navy border border-gray-100 dark:border-gray-800 rounded-xl rounded-tl-none p-3 shadow-sm text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white text-xs">{c.author?.firstName} {c.author?.lastName}</span>
                      <span className="text-gray-400 text-[10px]">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{c.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 bg-white dark:bg-midnight-navy border-t border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSendComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Type a reply..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800"
            />
            <button
              type="submit"
              disabled={addComment.isPending || !newComment.trim()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
