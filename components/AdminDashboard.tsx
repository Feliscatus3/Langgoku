'use client'

import { useState, useEffect } from 'react'
import AdminProductManager from './AdminProductManager'
import AdminBuyerManager from './AdminBuyerManager'
import AdminSettings from './AdminSettings'
import AdminPromoCodes from './AdminPromoCodes'

interface AdminDashboardProps {
  onLogout: () => void
}

interface Stats {
  totalProducts: number
  totalBuyers: number
  totalPromoCodes: number
  activeSubscriptions: number
  expiringSoon: number
}

interface Settings {
  storeName: string
  storeEmail: string
}

type TabType = 'dashboard' | 'products' | 'buyers' | 'promo' | 'settings'

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalBuyers: 0,
    totalPromoCodes: 0,
    activeSubscriptions: 0,
    expiringSoon: 0
  })
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    loadDashboardData()
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load stats
      const statsRes = await fetch('/api/products')
      const statsData = await statsRes.json()
      
      const buyersRes = await fetch('/api/buyers')
      const buyersData = await buyersRes.json()
      
      const promoRes = await fetch('/api/promo-codes')
      const promoData = await promoRes.json()
      
      const settingsRes = await fetch('/api/settings')
      const settingsData = await settingsRes.json()
      
      // Calculate stats
      const buyers = buyersData.data || []
      const activeSubscriptions = buyers.filter((b: any) => b.Status === 'active').length
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      const expiringSoon = buyers.filter((b: any) => {
        if (!b['Tanggal Selesai']) return false
        const endDate = new Date(b['Tanggal Selesai'])
        return endDate <= thirtyDaysFromNow && endDate > new Date()
      }).length
      
      setStats({
        totalProducts: statsData.count || 0,
        totalBuyers: buyers.length,
        totalPromoCodes: promoData.count || 0,
        activeSubscriptions,
        expiringSoon
      })
      
      if (settingsData.success && settingsData.data) {
        setSettings(settingsData.data)
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'products', label: 'Produk', icon: '📦' },
    { id: 'buyers', label: 'Pembeli', icon: '👥' },
    { id: 'promo', label: 'Kode Promo', icon: '🎫' },
    { id: 'settings', label: 'Pengaturan', icon: '⚙️' },
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

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
          <h2 className="text-lg font-medium">{settings?.storeName || 'Langgoku'}</h2>
          <p className="text-gray-400 text-xs mt-1">Admin Panel</p>
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
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'products' && 'Manajemen Produk'}
                {activeTab === 'buyers' && 'Manajemen Pembeli'}
                {activeTab === 'promo' && 'Kode Promo'}
                {activeTab === 'settings' && 'Pengaturan Toko'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Kelola data toko Anda</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="w-full">
            {activeTab === 'dashboard' && (
              <div>
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
                  <h2 className="text-3xl font-bold mb-2">{getGreeting()} 👋</h2>
                  <p className="text-blue-100 text-lg">Selamat datang di panel admin {settings?.storeName || 'Langgoku'}</p>
                  <p className="text-blue-200 text-sm mt-2">{formatDate()}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Products */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Total Produk</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="text-blue-600 text-sm mt-4 hover:underline"
                    >
                      Lihat produk →
                    </button>
                  </div>

                  {/* Total Buyers */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Total Pembeli</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBuyers}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">👥</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('buyers')}
                      className="text-green-600 text-sm mt-4 hover:underline"
                    >
                      Lihat pembeli →
                    </button>
                  </div>

                  {/* Active Subscriptions */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Aktif</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeSubscriptions}</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">✅</span>
                      </div>
                    </div>
                    <p className="text-emerald-600 text-sm mt-4">langganan aktif</p>
                  </div>

                  {/* Expiring Soon */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Expired Soon</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.expiringSoon}</p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                      </div>
                    </div>
                    <p className="text-amber-600 text-sm mt-4">dalam 30 hari</p>
                  </div>
                </div>

                {/* Promo Codes & Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Promo Codes Card */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Kode Promo</h3>
                      <span className="text-2xl">🎫</span>
                    </div>
                    <p className="text-gray-600 mb-4">{stats.totalPromoCodes} kode promo tersedia</p>
                    <button 
                      onClick={() => setActiveTab('promo')}
                      className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                    >
                      Kelola Kode Promo
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setActiveTab('products')}
                        className="w-full py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left px-4 flex items-center gap-2"
                      >
                        <span>➕</span> Tambah Produk Baru
                      </button>
                      <button 
                        onClick={() => setActiveTab('buyers')}
                        className="w-full py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left px-4 flex items-center gap-2"
                      >
                        <span>👥</span> Lihat Semua Pembeli
                      </button>
                      <button 
                        onClick={() => setActiveTab('settings')}
                        className="w-full py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left px-4 flex items-center gap-2"
                      >
                        <span>⚙️</span> Pengaturan Toko
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Gunakan kode promo untuk menarik customer baru</li>
                    <li>• Periksa customer yang akan expired untuk follow up</li>
                    <li>• Update pengaturan toko secara berkala</li>
                  </ul>
                </div>
              </div>
            )}
            {activeTab === 'products' && <AdminProductManager />}
            {activeTab === 'buyers' && <AdminBuyerManager />}
            {activeTab === 'promo' && <AdminPromoCodes />}
            {activeTab === 'settings' && <AdminSettings />}
          </div>
        </div>
      </main>
    </div>
  )
}