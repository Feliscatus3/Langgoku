'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Settings {
  storeName: string
  storeEmail: string
  maintenanceMode: boolean
  announcementText: string
  announcementEnabled: boolean
}

export default function MaintenancePage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.success && data.data) {
        setSettings(data.data)
        
        // If not in maintenance mode, redirect to home
        if (!data.data.maintenanceMode) {
          router.push('/')
          return
        }
      } else {
        // If no settings, allow access
        router.push('/')
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          🔧 Sedang Maintenance
        </h1>

        {/* Store Name */}
        {settings?.storeName && (
          <p className="text-gray-400 text-lg mb-6">
            {settings.storeName}
          </p>
        )}

        {/* Announcement */}
        {settings?.announcementEnabled && settings?.announcementText && (
          <div className="bg-white/10 rounded-xl p-4 mb-6">
            <p className="text-white whitespace-pre-wrap">
              {settings.announcementText}
            </p>
          </div>
        )}

        {/* Default Message */}
        <div className="text-gray-400 space-y-2">
          <p>Kami sedang melakukan perawatan sistem.</p>
          <p>Mohon maaf atas ketidaknyamanannya.</p>
          <p>Toko akan kembali online segera!</p>
        </div>

      </div>
    </div>
  )
}