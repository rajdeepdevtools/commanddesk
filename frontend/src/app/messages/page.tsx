"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ChatInterface } from "@/features/messages/components/chat-interface";
import { Search, Edit, User as UserIcon, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
  const { data: session } = useSession();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: () => apiClient.get("/messages").then(res => res.data),
    refetchInterval: 5000,
  });

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-100px)] bg-white dark:bg-[#0B1120] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Left Sidebar - Chat List */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-midnight-navy shrink-0">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                Messages
              </h2>
              <button className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading chats...</div>
            ) : chats.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                No messages yet. Click the edit icon to start a new conversation.
              </div>
            ) : (
              <div className="flex flex-col">
                {chats.map((chat: any) => {
                  const otherParticipant = chat.participants.find((p: any) => p.user.id !== session?.user?.id)?.user;
                  const chatName = chat.isGroup ? chat.name : (otherParticipant ? \`\${otherParticipant.firstName} \${otherParticipant.lastName}\` : "Unknown User");
                  const lastMessage = chat.messages?.[0];

                  return (
                    <div 
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={\`p-4 border-b border-gray-100 dark:border-gray-800/50 cursor-pointer transition-colors flex items-center gap-3
                        \${activeChatId === chat.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}
                      \`}
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0 overflow-hidden relative">
                        {otherParticipant?.avatarUrl ? (
                          <img src={otherParticipant.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          chatName.charAt(0)
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className={\`text-sm font-semibold truncate \${activeChatId === chat.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}\`}>
                            {chatName}
                          </h4>
                          {lastMessage && (
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true }).replace('about ', '')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {lastMessage ? (
                            <span className={lastMessage.senderId === session?.user?.id ? "text-gray-400" : "font-medium text-gray-700 dark:text-gray-300"}>
                              {lastMessage.senderId === session?.user?.id ? 'You: ' : ''}{lastMessage.content}
                            </span>
                          ) : (
                            <span className="italic text-gray-400">Start a conversation...</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Active Chat */}
        <div className="flex-1 bg-white dark:bg-[#0f172a]">
          {activeChatId ? (
            <ChatInterface chatId={activeChatId} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50/30 dark:bg-midnight-navy">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">CommandDesk Chat</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Select a conversation from the sidebar or start a new one to begin messaging your team.
              </p>
              <button className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
                New Message
              </button>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
