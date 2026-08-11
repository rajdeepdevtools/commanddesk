"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useState } from "react";
import { Search, Plus, Package, MapPin, Activity } from "lucide-react";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"items" | "movements">("items");

  // Mock data for UI demonstration until API is connected
  const inventory = [
    { id: "1", name: "MacBook Pro M3", sku: "HW-MAC-01", category: "Hardware", qty: 24, status: "IN_STOCK", warehouse: "HQ Tech Room" },
    { id: "2", name: "Dell UltraSharp 27\"", sku: "HW-MON-05", category: "Hardware", qty: 3, status: "LOW_STOCK", warehouse: "HQ Tech Room" },
    { id: "3", name: "Herman Miller Chair", sku: "FUR-CH-02", category: "Furniture", qty: 0, status: "OUT_OF_STOCK", warehouse: "Mumbai Office" },
    { id: "4", name: "AWS Server Rack", sku: "HW-SRV-01", category: "Infrastructure", qty: 2, status: "IN_STOCK", warehouse: "Mumbai Datacenter" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white">Assets & Inventory</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track hardware, furniture, and warehouse stock levels.</p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Assets</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1,248</h3>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Low Stock Items</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">15</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Warehouses</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">3</h3>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setActiveTab("items")}
                className={`font-medium pb-4 -mb-4 border-b-2 transition-colors \${activeTab === "items" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"}`}
              >
                Inventory List
              </button>
              <button 
                onClick={() => setActiveTab("movements")}
                className={`font-medium pb-4 -mb-4 border-b-2 transition-colors \${activeTab === "movements" ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"}`}
              >
                Stock Movements
              </button>
            </div>
            
            {activeTab === "items" && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search SKU or Name..." 
                  className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                />
              </div>
            )}
          </div>
          
          <div className="p-0">
            {activeTab === "items" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-4 font-semibold">SKU / Item Name</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Location</th>
                      <th className="px-6 py-4 font-semibold">In Stock</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {inventory.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.sku}</p>
                        </td>
                        <td className="px-6 py-4">{item.category}</td>
                        <td className="px-6 py-4">{item.warehouse}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.qty} units</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold 
                            \${item.status === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-700' 
                              : item.status === 'LOW_STOCK' ? 'bg-orange-100 text-orange-700' 
                              : 'bg-red-100 text-red-700'}`}>
                            {item.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <p>Audit Log of Check-Ins & Check-Outs</p>
                <p className="text-sm mt-2">Connects to `StockMovement` model.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
