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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Admin Header */}
      <div className="bg-gradient-primary/95 backdrop-blur-md sticky top-0 z-40 shadow-lg border-b border-primary-200">
        <div className="container-custom py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">🎛️ Admin Dashboard</h1>
            <p className="text-primary-100 text-sm font-medium mt-1">Manajemen produk &amp; pembeli</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 transform"
          >
            ← Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/70 border-b border-primary-100 backdrop-blur-sm">
        <div className="container-custom">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-2 border-b-3 font-semibold transition-all duration-300 ${
                activeTab === 'products'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-primary-600 hover:text-primary-700'
              }`}
            >
              📦 Manajemen Produk
            </button>
            <button
              onClick={() => setActiveTab('buyers')}
              className={`py-4 px-2 border-b-3 font-semibold transition-all duration-300 ${
                activeTab === 'buyers'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-primary-600 hover:text-primary-700'
              }`}
            >
              👥 Manajemen Pembeli
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-10">
        {activeTab === 'products' && <AdminProductManager />}
        {activeTab === 'buyers' && <AdminBuyerManager />}
      </div>
    </div>
  )
}
