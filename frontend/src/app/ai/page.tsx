"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { apiClient } from "@/lib/api-client";
import { Sparkles, Send, User, Bot, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Summarize Q3 Finance revenue",
  "How many active employees in HR?",
  "Show me open support tickets",
  "Generate a payroll summary report"
];

export default function AICopilotPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am CommandDesk Copilot. I have deep context into your company's HR, Finance, Projects, and Support data. How can I help you today?" }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: (text: string) => apiClient.post("/ai/chat", { prompt: text }).then(res => res.data),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    },
    onError: () => {
      toast.error("Failed to connect to AI service.");
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I encountered an error connecting to the intelligence server." }]);
    }
  });

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message immediately
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setPrompt("");
    
    // Trigger AI
    chatMutation.mutate(text);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-white dark:bg-midnight-navy border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Enterprise Copilot
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] uppercase font-bold tracking-wider dark:bg-indigo-900/30 dark:text-indigo-400">Beta</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Context-aware AI for your business data.</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`px-5 py-3.5 max-w-[80%] rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-sm' 
                  : 'bg-white border border-gray-100 dark:border-gray-800 dark:bg-[#0f172a] text-gray-700 dark:text-gray-300 rounded-tl-sm shadow-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading State */}
          {chatMutation.isPending && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-white border border-gray-100 dark:border-gray-800 dark:bg-[#0f172a] rounded-tl-sm shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span className="text-sm text-gray-500">Analyzing company data...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
          
          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTIONS.map(sugg => (
                <button
                  key={sugg}
                  onClick={() => handleSend(sugg)}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors flex items-center gap-1.5 group"
                >
                  {sugg} <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </button>
              ))}
            </div>
          )}

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(prompt); }} 
            className="relative flex items-center"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Copilot about your business..."
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full pl-5 pr-14 py-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:text-white transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || chatMutation.isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400">AI can make mistakes. Verify critical business numbers.</span>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
