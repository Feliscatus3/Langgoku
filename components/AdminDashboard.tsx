'use client'

import { useState, useEffect } from 'react'
import AdminProductManager from './AdminProductManager'
import AdminBuyerManager from './AdminBuyerManager'
import AdminSettings from './AdminSettings'
import AdminPromoCodes from './AdminPromoCodes'
import AdminPromoAds from './AdminPromoAds'

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

interface Buyer {
  ID: string
  Nama: string
  No_WhatsApp: string
  Produk: string
  Durasi: string
  'Tanggal Selesai': string
  Status: string
}

interface Settings {
  storeName: string
  storeEmail: string
}

type TabType = 'dashboard' | 'products' | 'buyers' | 'promo' | 'ads' | 'settings'

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
  const [expiringBuyers, setExpiringBuyers] = useState<Buyer[]>([])
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
      // Load products
      const productsRes = await fetch('/api/products')
      const productsData = await productsRes.json()
      
      // Load buyers
      const buyersRes = await fetch('/api/buyers')
      const buyersData = await buyersRes.json()
      
      // Load promo codes
      const promoRes = await fetch('/api/promo-codes')
      const promoData = await promoRes.json()
      
      // Load settings
      const settingsRes = await fetch('/api/settings')
      const settingsData = await settingsRes.json()
      
      // Process buyers data - handle both data formats
      const buyers = buyersData.data || []
      
      // Calculate active subscriptions (Status = 'active')
      const activeSubscriptions = buyers.filter((b: any) => {
        const status = b.Status || b.status || ''
        return status.toLowerCase() === 'active'
      }).length
      
      // Calculate expiring soon (within 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      
      const expiringList: Buyer[] = []
      let expiringCount = 0
      
      buyers.forEach((b: any) => {
        const endDateStr = b['Tanggal Selesai'] || b['Tanggal Selesai'] || b.endDate || ''
        if (endDateStr) {
          try {
            const endDate = new Date(endDateStr)
            // Check if not expired yet but will expire within 30 days
            if (endDate > new Date() && endDate <= thirtyDaysFromNow) {
              expiringCount++
              expiringList.push({
                ID: b.ID || b.id || '',
                Nama: b.Nama || b.name || '',
                No_WhatsApp: b.No_WhatsApp || b['No WhatsApp'] || b.phone || '',
                Produk: b.Produk || b.product || '',
                Durasi: b.Durasi || b.duration || '',
                'Tanggal Selesai': endDateStr,
                Status: b.Status || b.status || ''
              })
            }
          } catch (e) {
            // Skip invalid dates
          }
        }
      })
      
      // Get total product count
      const totalProducts = Array.isArray(productsData.data) ? productsData.data.length : (productsData.count || 0)
      
      setStats({
        totalProducts,
        totalBuyers: buyers.length,
        totalPromoCodes: Array.isArray(promoData.data) ? promoData.data.length : (promoData.count || 0),
        activeSubscriptions,
        expiringSoon: expiringCount
      })
      
      // Set expiring buyers (max 5 for display)
      setExpiringBuyers(expiringList.slice(0, 5))
      
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
    { id: 'ads', label: 'Iklan/Promo', icon: '📢' },
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

  const formatDateShort = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen flex">
      {/* Sidebar - Full screen on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transition-transform duration-300 z-30 md:z-20 h-full flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative`}
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
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <div className="bg-gray-900 md:bg-white border-b border-gray-800 md:border-gray-200 sticky top-0 z-30">
          <div className="flex items-center p-4 md:p-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1 ml-4">
              <h1 className="text-xl md:text-2xl font-medium text-white md:text-gray-950">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'products' && 'Manajemen Produk'}
                {activeTab === 'buyers' && 'Manajemen Pembeli'}
                {activeTab === 'promo' && 'Kode Promo'}
                {activeTab === 'ads' && 'Iklan & Promo'}
                {activeTab === 'settings' && 'Pengaturan Toko'}
              </h1>
              <p className="text-sm text-gray-400 md:text-gray-500 mt-1">Kelola data toko Anda</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-2 md:p-8 overflow-auto">
          <div className="w-full max-w-full">
            {activeTab === 'dashboard' && (
              <div>
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
                  <h2 className="text-3xl font-bold mb-2 text-white">{getGreeting()} 👋</h2>
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

                {/* Expiring Soon List */}
                {expiringBuyers.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">⚠️ Langganan Akan Habis</h3>
                      <button 
                        onClick={() => setActiveTab('buyers')}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Lihat Semua →
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-gray-600 font-medium">Nama</th>
                            <th className="px-4 py-2 text-left text-gray-600 font-medium">Produk</th>
                            <th className="px-4 py-2 text-left text-gray-600 font-medium">WhatsApp</th>
                            <th className="px-4 py-2 text-left text-gray-600 font-medium">Tanggal Selesai</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {expiringBuyers.map((buyer) => (
                            <tr key={buyer.ID} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{buyer.Nama}</td>
                              <td className="px-4 py-3 text-gray-600">{buyer.Produk}</td>
                              <td className="px-4 py-3 text-gray-600">{buyer.No_WhatsApp}</td>
                              <td className="px-4 py-3 text-amber-600 font-medium">
                                {formatDateShort(buyer['Tanggal Selesai'])}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

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
            {activeTab === 'ads' && <AdminPromoAds />}
            {activeTab === 'settings' && <AdminSettings />}
          </div>
        </div>
      </main>
    </div>
  )
}