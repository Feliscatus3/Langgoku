'use client'

import { useState, useEffect } from 'react'
import AdminProductManager from './AdminProductManager'
import AdminBuyerManager from './AdminBuyerManager'

interface AdminDashboardProps {
  onLogout: () => void
}

type TabType = 'products' | 'buyers'

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('products')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navItems = [
    { id: 'products', label: '📦 Produk', icon: '📦', color: 'from-blue-500 to-cyan-500' },
    { id: 'buyers', label: '👥 Pembeli', icon: '👥', color: 'from-purple-500 to-pink-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-72 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white shadow-2xl transition-transform duration-300 z-20 h-screen flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-blue-700/50 bg-gradient-to-r from-blue-700 to-purple-700">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">⚙️</span>
            <span>Admin Panel</span>
          </h2>
          <p className="text-blue-300 text-xs mt-2 font-semibold">Kontrol Langgoku v1.0</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4">
          <p className="text-blue-400 text-xs font-bold uppercase mb-6 px-2 tracking-widest">📋 Menu Utama</p>
          <div className="space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType)
                  if (isMobile) setSidebarOpen(false)
                }}
                className={`w-full text-left px-4 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                  activeTab === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                    : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-700/50 space-y-3">
          <button
            onClick={() => {
              onLogout()
              setSidebarOpen(false)
            }}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 hover:scale-105"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {activeTab === 'products' ? '📦 Manajemen Produk' : '👥 Manajemen Pembeli'}
                </h1>
                <p className="text-gray-500 text-xs md:text-sm">Kelola & monitor data Langgoku dengan mudah</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'products' && <AdminProductManager />}
            {activeTab === 'buyers' && <AdminBuyerManager />}
          </div>
        </div>
      </main>
    </div>
  )
}
