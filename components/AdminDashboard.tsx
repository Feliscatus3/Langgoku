'use client'

import { useState, useEffect } from 'react'
import AdminProductManager from './AdminProductManager'
import AdminBuyerManager from './AdminBuyerManager'
import AdminSettings from './AdminSettings'

interface AdminDashboardProps {
  onLogout: () => void
}

type TabType = 'products' | 'buyers' | 'settings'

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
    { id: 'products', label: 'Produk', icon: '📦' },
    { id: 'buyers', label: 'Pembeli', icon: '👥' },
    { id: 'settings', label: 'Pengaturan', icon: '⚙️' },
  ]

  return (
    <div className="bg-white min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 bg-gray-900 text-white transition-transform duration-300 z-20 h-screen flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-medium">Langgoku Admin</h2>
          <p className="text-gray-400 text-xs mt-1">Control Panel v1.0</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType)
                  if (isMobile) setSidebarOpen(false)
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              onLogout()
              setSidebarOpen(false)
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Logout
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
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center p-4 md:p-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1 ml-4">
              <h1 className="text-2xl font-medium text-gray-950">
                {activeTab === 'products' && 'Manajemen Produk'}
                {activeTab === 'buyers' && 'Manajemen Pembeli'}
                {activeTab === 'settings' && 'Pengaturan Toko'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Kelola data toko Anda</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="w-full">
            {activeTab === 'products' && <AdminProductManager />}
            {activeTab === 'buyers' && <AdminBuyerManager />}
            {activeTab === 'settings' && <AdminSettings />}
          </div>
        </div>
      </main>
    </div>
  )
}
