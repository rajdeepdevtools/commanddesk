"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Layout, Type, Image as ImageIcon, Box, LayoutGrid, 
  Settings, ChevronLeft, Eye, Play, Save, GripVertical
} from "lucide-react";

export default function WebsiteBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [blocks, setBlocks] = useState([
    { id: 1, type: "hero", title: "Hero Section" },
    { id: 2, type: "features", title: "Features Grid" },
    { id: 3, type: "cta", title: "Call to Action" }
  ]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-[#0B1120] overflow-hidden font-sans">
      
      {/* Top Navbar */}
      <header className="absolute top-0 left-0 right-0 h-14 bg-white dark:bg-midnight-navy border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/websites")}
            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
          <span className="font-semibold text-sm text-gray-900 dark:text-white capitalize flex items-center gap-2">
            <GlobeIcon className="w-4 h-4 text-indigo-500" />
            {siteId.replace("-", " ")}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">Draft</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
            <Save className="w-4 h-4" /> Save
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
            <Play className="w-4 h-4" /> Publish
          </button>
        </div>
      </header>

      {/* Left Sidebar - Components */}
      <aside className="absolute top-14 bottom-0 left-0 w-64 bg-white dark:bg-midnight-navy border-r border-gray-200 dark:border-gray-800 flex flex-col z-10">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Add Elements</h3>
        </div>
        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          {/* Draggable blocks mock */}
          <DraggableItem icon={<Layout />} label="Section" />
          <DraggableItem icon={<Type />} label="Heading" />
          <DraggableItem icon={<ImageIcon />} label="Image" />
          <DraggableItem icon={<LayoutGrid />} label="Grid Layout" />
          <DraggableItem icon={<Box />} label="Button" />
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="absolute top-14 bottom-0 left-64 right-64 bg-gray-100 dark:bg-[#0f172a] p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white dark:bg-midnight-navy min-h-full rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden relative">
          
          {/* Browser Mockup Header */}
          <div className="h-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="mx-4 flex-1 h-6 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-[10px] text-gray-400 flex items-center px-3 justify-center">
              https://{siteId}.commanddesk.com
            </div>
          </div>

          {/* Builder Canvas content */}
          <div className="p-8 flex flex-col gap-6">
            {blocks.map((block) => (
              <div key={block.id} className="relative group border-2 border-dashed border-transparent hover:border-indigo-400 rounded-xl p-6 transition-colors bg-gray-50/50 dark:bg-gray-900/50">
                
                {/* Block Controls (appear on hover) */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-2">
                  <GripVertical className="w-3 h-3 cursor-grab" />
                  {block.title}
                  <Settings className="w-3 h-3 cursor-pointer ml-1" />
                </div>

                {/* Mock Content based on type */}
                {block.type === 'hero' && (
                  <div className="text-center py-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Empower Your Workforce</h1>
                    <p className="text-gray-500 max-w-xl mx-auto mb-8">The all-in-one operating system for modern enterprises. Manage HR, Projects, and CRM in one place.</p>
                    <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium">Get Started</button>
                  </div>
                )}
                
                {block.type === 'features' && (
                  <div className="grid grid-cols-3 gap-6 py-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mb-4"></div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Feature {i}</h4>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                )}

                {block.type === 'cta' && (
                  <div className="bg-indigo-600 rounded-2xl p-8 text-center text-white my-8">
                    <h2 className="text-2xl font-bold mb-2">Ready to transform your business?</h2>
                    <p className="text-indigo-100 mb-6 text-sm">Join thousands of companies using our platform.</p>
                    <button className="bg-white text-indigo-900 px-6 py-2 rounded-lg font-semibold text-sm">Contact Sales</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Right Sidebar - Properties */}
      <aside className="absolute top-14 bottom-0 right-0 w-64 bg-white dark:bg-midnight-navy border-l border-gray-200 dark:border-gray-800 z-10 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Properties</h3>
        </div>
        <div className="p-4 flex-1 flex flex-col items-center justify-center text-center text-gray-400">
          <Settings className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">Select an element on the canvas to edit its properties.</p>
        </div>
      </aside>
    </div>
  );
}

function DraggableItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-grab active:cursor-grabbing transition-colors">
      <div className="text-gray-500 dark:text-gray-400 w-5 h-5">{icon}</div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <GripVertical className="w-4 h-4 ml-auto text-gray-400" />
    </div>
  );
}

function GlobeIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
      <path d="M2 12h20"/>
    </svg>
  );
}
