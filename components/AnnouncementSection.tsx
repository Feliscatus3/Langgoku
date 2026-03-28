'use client'

import { useState, useEffect } from 'react'

interface Settings {
  announcementText: string
  announcementEnabled: boolean
}

export default function AnnouncementSection() {
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
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  // Don't show if not enabled or no text
  if (!settings?.announcementEnabled || !settings?.announcementText) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200">
      <div className="container-custom py-4 md:py-6">
        <div className="flex items-start gap-3 md:gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h3 className="text-sm md:text-base font-semibold text-amber-800 mb-1">
              📢 Pengumuman
            </h3>
            <p className="text-sm md:text-base text-amber-900 whitespace-pre-wrap">
              {settings.announcementText}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}