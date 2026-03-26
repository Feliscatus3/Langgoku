'use client'

import { useState, useEffect } from 'react'
import { calculateRemainingDays, getSubscriptionStatus } from '@/lib/googleSheets'

interface Buyer {
  id: string
  name: string
  phone: string
  product: string
  duration: string
  startDate: string
  endDate: string
  status: 'active' | 'expiring' | 'expired'
  remainingDays: number
  notified?: boolean
  notificationSentAt?: string
  // Mapping dari Google Sheets column names
  'Nama'?: string
  'No WhatsApp'?: string
  'Produk'?: string
  'Durasi'?: string
  'Tanggal Mulai'?: string
  'Tanggal Selesai'?: string
  'Status'?: string
  'Sisa Hari'?: number
  'Notified'?: boolean
  'Notified At'?: string
  'ID'?: string
}

function normalizeBuyer(raw: any): Buyer {
  // Handle both camelCase (local) and Google Sheets column names
  const id = raw.id || raw.ID || ''
  const name = raw.name || raw.Nama || ''
  const phone = raw.phone || raw['No WhatsApp'] || ''
  const product = raw.product || raw.Produk || ''
  const duration = raw.duration || raw.Durasi || ''
  const startDate = raw.startDate || raw['Tanggal Mulai'] || ''
  const endDate = raw.endDate || raw['Tanggal Selesai'] || ''
  const notified = raw.notified || raw.Notified || false
  const notificationSentAt = raw.notificationSentAt || raw['Notified At'] || ''

  const remainingDays = endDate ? calculateRemainingDays(new Date(endDate)) : 0
  const status = getSubscriptionStatus(remainingDays)

  return {
    id,
    name,
    phone,
    product,
    duration,
    startDate,
    endDate,
    status,
    remainingDays,
    notified,
    notificationSentAt,
  }
}

export default function AdminBuyerManager() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [customDurationValue, setCustomDurationValue] = useState('')
  const [customDurationType, setCustomDurationType] = useState<'hari' | 'minggu' | 'bulan'>('hari')
  const [products, setProducts] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    product: '',
    duration: '1 bulan',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })

  const durations = ['1 hari', '2 hari', '3 hari', '1 minggu', '1 bulan', '3 bulan', '6 bulan', '1 tahun']

  useEffect(() => {
    fetchBuyers()
    loadProducts()
  }, [])

  const fetchBuyers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/buyers')
      const data = await response.json()
      
      if (data.success && data.data && data.data.length > 0) {
        const normalized = data.data.map(normalizeBuyer)
        setBuyers(normalized)
        // Cache ke localStorage sebagai fallback
        localStorage.setItem('langgoku_buyers', JSON.stringify(normalized))
      } else {
        // Fallback ke localStorage jika API gagal atau kosong
        const savedBuyers = localStorage.getItem('langgoku_buyers')
        if (savedBuyers) {
          setBuyers(JSON.parse(savedBuyers))
        }
      }
    } catch (err) {
      console.error('Error fetching buyers from API, using localStorage fallback:', err)
      const savedBuyers = localStorage.getItem('langgoku_buyers')
      if (savedBuyers) {
        setBuyers(JSON.parse(savedBuyers))
      }
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.success && data.data) {
        setProducts(data.data.map((p: any) => p.name || p['Nama Produk'] || '').filter(Boolean))
      }
    } catch (err) {
      console.error('Error loading products:', err)
    }
  }

  const calculateEndDate = (startDate: string, duration: string) => {
    const start = new Date(startDate)
    if (duration.includes('hari')) {
      const days = parseInt(duration)
      start.setDate(start.getDate() + days)
    } else if (duration.includes('minggu')) {
      const weeks = parseInt(duration)
      start.setDate(start.getDate() + weeks * 7)
    } else if (duration.includes('bulan')) {
      const months = parseInt(duration)
      start.setMonth(start.getMonth() + months)
    } else if (duration.includes('tahun')) {
      const years = parseInt(duration)
      start.setFullYear(start.getFullYear() + years)
    }
    return start.toISOString().split('T')[0]
  }

  const handleDurationChange = (duration: string) => {
    if (duration === 'custom') {
      setShowCustomDuration(true)
      return
    }
    setShowCustomDuration(false)
    setFormData({
      ...formData,
      duration,
      endDate: calculateEndDate(formData.startDate, duration),
    })
  }

  const handleCustomDurationApply = () => {
    if (!customDurationValue || isNaN(parseInt(customDurationValue))) {
      alert('Masukkan angka yang valid')
      return
    }
    
    const customDuration = `${customDurationValue} ${customDurationType}`
    const endDate = calculateEndDate(formData.startDate, customDuration)
    
    setFormData({
      ...formData,
      duration: customDuration,
      endDate: endDate,
    })
    setShowCustomDuration(false)
  }

  const handleStartDateChange = (date: string) => {
    setFormData({
      ...formData,
      startDate: date,
      endDate: calculateEndDate(date, formData.duration),
    })
  }

  const handleAddBuyer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone || !formData.product) {
      alert('Harap isi semua field yang wajib diisi (*)')
      return
    }

    setSubmitting(true)

    try {
      if (editingId) {
        // Update existing buyer via API
        const response = await fetch(`/api/buyers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await response.json()

        if (data.success) {
          // Refresh data dari API
          await fetchBuyers()
          alert('Data pembeli berhasil diperbarui')
        } else {
          alert('Gagal memperbarui pembeli: ' + (data.message || 'Unknown error'))
        }
      } else {
        // Add new buyer via API
        const response = await fetch('/api/buyers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await response.json()

        if (data.success) {
          // Refresh data dari API
          await fetchBuyers()
          alert('Data pembeli berhasil ditambahkan')
        } else {
          alert('Gagal menambahkan pembeli: ' + (data.message || 'Unknown error'))
        }
      }

      handleCancelEdit()
    } catch (err) {
      console.error('Error saving buyer:', err)
      alert('Terjadi kesalahan saat menyimpan data pembeli')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditBuyer = (buyer: Buyer) => {
    setFormData({
      name: buyer.name,
      phone: buyer.phone,
      product: buyer.product,
      duration: buyer.duration,
      startDate: buyer.startDate,
      endDate: buyer.endDate,
    })
    setEditingId(buyer.id)
    setShowForm(true)
  }

  const handleDeleteBuyer = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pembeli ini?')) return

    try {
      const response = await fetch(`/api/buyers/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        // Refresh data dari API
        await fetchBuyers()
        alert('Data pembeli berhasil dihapus')
      } else {
        alert('Gagal menghapus pembeli: ' + (data.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error deleting buyer:', err)
      alert('Terjadi kesalahan saat menghapus pembeli')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setShowForm(false)
    setShowCustomDuration(false)
    setFormData({
      name: '',
      phone: '',
      product: '',
      duration: '1 bulan',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    })
  }

  const sendReminderNotification = async (buyer: Buyer) => {
    try {
      const message = encodeURIComponent(
        `Halo ${buyer.name}!\n\nPengingat Langganan Langgoku\n\nLangganan Anda untuk ${buyer.product} akan berakhir pada:\n${buyer.endDate}\n\nSisa waktu: ${buyer.remainingDays} hari\n\nJangan sampai kehabisan! Perpanjang langganan Anda sekarang.\n\nTerima kasih telah mempercayai Langgoku!`
      )
      
      // Open WhatsApp with the message
      const whatsappUrl = `https://wa.me/${buyer.phone.replace(/\D/g, '')}?text=${message}`
      window.open(whatsappUrl, '_blank')
      
      // Update the buyer as notified (local state + localStorage cache)
      const updatedBuyers = buyers.map(b => 
        b.id === buyer.id 
          ? { ...b, notified: true, notificationSentAt: new Date().toISOString() }
          : b
      )
      setBuyers(updatedBuyers)
      localStorage.setItem('langgoku_buyers', JSON.stringify(updatedBuyers))
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Gagal mengirim pengingat')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'expiring':
        return 'Akan Habis'
      case 'expired':
        return 'Habis'
      default:
        return status
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-blue-600 font-medium">Memuat data pembeli...</div>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-950 mb-1">Manajemen Pembeli</h2>
          <p className="text-gray-600 text-sm">Kelola data pelanggan dan masa berlaku langganan</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary whitespace-nowrap"
          >
            + Tambah Pembeli
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-8 mb-8 border border-gray-200 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-950 mb-6">
            {editingId ? 'Edit Data Pembeli' : 'Tambah Pembeli Baru'}
          </h3>

          <form onSubmit={handleAddBuyer} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Pembeli/Customer *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor WhatsApp/Telepon *
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 6281234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produk yang Dibeli *
              </label>
              <select
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="">-- Pilih Produk --</option>
                {products.map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
              <p className="text-gray-500 text-xs mt-1">Jika produk tidak ada di list, tambahkan dulu di menu Produk</p>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Durasi Langganan *
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {durations.map(duration => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => handleDurationChange(duration)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      formData.duration === duration
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {duration}
                  </button>
                ))}
              </div>

              {/* Custom Duration */}
              {showCustomDuration && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    min="1"
                    value={customDurationValue}
                    onChange={(e) => setCustomDurationValue(e.target.value)}
                    placeholder="Jumlah"
                    className="input-field flex-1"
                  />
                  <select
                    value={customDurationType}
                    onChange={(e) => setCustomDurationType(e.target.value as any)}
                    className="input-field w-28"
                  >
                    <option value="hari">Hari</option>
                    <option value="minggu">Minggu</option>
                    <option value="bulan">Bulan</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleCustomDurationApply}
                    className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                  >
                    Terapkan
                  </button>
                </div>
              )}

              {!showCustomDuration && (
                <button
                  type="button"
                  onClick={() => setShowCustomDuration(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Durasi Custom
                </button>
              )}
            </div>

            {/* Start & End Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Berakhir
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  disabled
                  className="input-field w-full bg-gray-100 cursor-not-allowed"
                />
                <p className="text-gray-500 text-xs mt-1">Otomatis dihitung berdasarkan durasi</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting
                  ? (editingId ? 'Menyimpan...' : 'Menambahkan...')
                  : (editingId ? 'Update Pembeli' : 'Tambah Pembeli')}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={submitting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buyers List */}
      {buyers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">Belum ada data pembeli</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Tambah Pembeli Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {buyers.map(buyer => {
            const status = getSubscriptionStatus(buyer.remainingDays)
            return (
              <div key={buyer.id} className="card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-950">{buyer.name}</h3>
                    <p className="text-gray-600 text-sm">{buyer.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Produk</p>
                    <p className="font-semibold text-gray-950">{buyer.product}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Durasi</p>
                    <p className="font-semibold text-gray-950">{buyer.duration}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Sisa Hari</p>
                    <p className="font-semibold text-gray-950">{buyer.remainingDays} hari</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Berakhir</p>
                    <p className="font-semibold text-gray-950">{buyer.endDate}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditBuyer(buyer)}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => sendReminderNotification(buyer)}
                    className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium transition-colors"
                  >
                    Kirim Reminder
                  </button>
                  <button
                    onClick={() => handleDeleteBuyer(buyer.id)}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
