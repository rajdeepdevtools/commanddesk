"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Send, Loader2, User as UserIcon, MoreVertical, Phone, Video } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";


interface ChatInterfaceProps {
  chatId: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const session: any = { user: { id: "" } };

  const { data: chat, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => apiClient.get(`/messages/\${chatId}`).then(res => res.data),
    refetchInterval: 3000, // Poll every 3 seconds for real-time feel
  });

  const sendMessage = useMutation({
    mutationFn: (text: string) => apiClient.post(`/messages/\${chatId}`, { content: text }),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: () => {
      toast.error("Failed to send message");
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!chat) return null;

  // Find the "other" person in a 1-on-1 chat
  const otherParticipant = chat.participants.find((p: any) => p.user.id !== session?.user?.id)?.user;
  const chatName = chat.isGroup ? chat.name : (otherParticipant ? `\${otherParticipant.firstName} \${otherParticipant.lastName}` : "Unknown User");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f172a]">
      {/* Header */}
      <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden">
            {otherParticipant?.avatarUrl ? (
              <img src={otherParticipant.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              chatName.charAt(0)
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{chatName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {chat.isGroup ? `\${chat.participants.length} members` : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <button className="hover:text-indigo-600 transition-colors"><Phone className="w-5 h-5" /></button>
          <button className="hover:text-indigo-600 transition-colors"><Video className="w-5 h-5" /></button>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-800"></div>
          <button className="hover:text-indigo-600 transition-colors"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {chat.messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <UserIcon className="w-8 h-8" />
            </div>
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          chat.messages.map((msg: any, idx: number) => {
            const isMe = msg.sender.id === session?.user?.id;
            return (
              <div key={msg.id} className={`flex flex-col max-w-[75%] \${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                <div className={`flex items-end gap-2 \${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {msg.sender.avatarUrl ? (
                      <img src={msg.sender.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-500 font-bold">{msg.sender.firstName.charAt(0)}</span>
                    )}
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed
                    \${isMe 
                      ? 'bg-indigo-600 text-white rounded-br-sm shadow-sm' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-200 dark:border-gray-700 shadow-sm'}`}>
                    {msg.content}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-8">
                  {format(new Date(msg.createdAt), "h:mm a")}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-midnight-navy border-t border-gray-200 dark:border-gray-800 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); if (content.trim()) sendMessage.mutate(content); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 dark:bg-gray-900 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#0f172a] focus:ring-2 focus:ring-indigo-500/20 rounded-full px-5 py-3 text-sm outline-none transition-all dark:text-white"
          />
          <button
            type="submit"
            disabled={!content.trim() || sendMessage.isPending}
            className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
