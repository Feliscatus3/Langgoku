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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container-custom py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-4 border-b-2 font-semibold transition ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Manajemen Produk
            </button>
            <button
              onClick={() => setActiveTab('buyers')}
              className={`py-4 px-4 border-b-2 font-semibold transition ${
                activeTab === 'buyers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Manajemen Pembeli
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {activeTab === 'products' && <AdminProductManager />}
        {activeTab === 'buyers' && <AdminBuyerManager />}
      </div>
    </div>
  )
}
