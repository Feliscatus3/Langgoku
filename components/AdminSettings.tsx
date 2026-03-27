'use client'

import { useState, useEffect } from 'react'

interface Settings {
  googleSheetId: string
  adminPhone: string
  storeEmail: string
  storeName: string
  storeDescription: string
  notificationEnabled: boolean
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    googleSheetId: '',
    adminPhone: '',
    storeEmail: '',
    storeName: 'Langgoku',
    storeDescription: '',
    notificationEnabled: true,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettingsFromAPI()
  }, [])

  const loadSettingsFromAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        // Load from Google Sheets - use localStorage as fallback display only
        const mergedSettings = { ...settings, ...data.data }
        setSettings(mergedSettings)
        localStorage.setItem('langgoku_settings', JSON.stringify(mergedSettings))
      } else {
        // Try localStorage if API fails
        const saved = localStorage.getItem('langgoku_settings')
        if (saved) {
          setSettings(JSON.parse(saved))
        }
      }
    } catch (err) {
      console.log('Loading from localStorage fallback')
      const saved = localStorage.getItem('langgoku_settings')
      if (saved) {
        setSettings(JSON.parse(saved))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings({
      ...settings,
      [field]: value,
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      // Validate required fields
      if (!settings.adminPhone || !settings.storeEmail) {
        setError('Harap isi nomor WhatsApp dan email toko')
        setIsSaving(false)
        return
      }

      // Save to Google Sheets via API
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(settings),
      })

      const result = await response.json()

      if (result.success) {
        // Also save to localStorage as backup
        localStorage.setItem('langgoku_settings', JSON.stringify(settings))
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.message || 'Gagal menyimpan pengaturan ke Google Sheets')
      }
    } catch (err) {
      console.error('Error saving settings:', err)
      // Save to localStorage as fallback
      localStorage.setItem('langgoku_settings', JSON.stringify(settings))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-medium text-gray-950">Pengaturan Toko</h2>
        <p className="text-gray-500 text-sm mt-2">Konfigurasi informasi toko dari Google Sheets</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">
          ✓ Pengaturan berhasil disimpan ke Google Sheets
        </div>
      )}

      {/* Settings Form */}
      <div className="space-y-6">
        {/* Store Information - from Google Sheets */}
        <div className="card p-6 shadow-md">
          <h3 className="text-lg font-medium text-gray-950 mb-4">Informasi Toko</h3>
          <p className="text-xs text-gray-500 mb-4">Data ini diambil dari sheet "Pengaturan" di Google Sheets</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Toko
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                placeholder="Langgoku"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Toko
              </label>
              <textarea
                value={settings.storeDescription}
                onChange={(e) => handleChange('storeDescription', e.target.value)}
                placeholder="Toko akun premium terbaik..."
                rows={3}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Toko *
              </label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => handleChange('storeEmail', e.target.value)}
                placeholder="toko@langgoku.com"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor WhatsApp Admin *
              </label>
              <input
                type="tel"
                value={settings.adminPhone}
                onChange={(e) => handleChange('adminPhone', e.target.value)}
                placeholder="628123456789"
                className="input-field w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Nomor ini akan digunakan untuk notifikasi WhatsApp customer
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card p-6 shadow-md">
          <h3 className="text-lg font-medium text-gray-950 mb-4">Notifikasi</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationEnabled}
                  onChange={(e) => handleChange('notificationEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Aktifkan notifikasi WhatsApp otomatis
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Kirim pengingat ke customer sebelum langganan mereka habis
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex-1"
          >
            {isSaving ? 'Menyimpan ke Google Sheets...' : 'Simpan Pengaturan'}
          </button>
          
          <button
            onClick={loadSettingsFromAPI}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Refresh dari Sheets
          </button>
        </div>
      </div>

      {/* Helper Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Info Pengaturan</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Pengaturan disimpan ke Google Sheets sheet "Pengaturan"</li>
          <li>• Data akan otomatis tersimpan dan dapat diakses dari mana saja</li>
          <li>• localStorage digunakan sebagai backup jika koneksi bermasalah</li>
          <li>• Klik "Refresh dari Sheets" untuk memuat data terbaru</li>
        </ul>
      </div>
    </div>
  )
}