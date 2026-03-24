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
}

export default function AdminBuyerManager() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
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
    // Load buyers from localStorage
    const savedBuyers = localStorage.getItem('langgoku_buyers')
    if (savedBuyers) {
      setBuyers(JSON.parse(savedBuyers))
    }

    // Load products for dropdown
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.success && data.data) {
        setProducts(data.data.map((p: any) => p.name))
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

  const handleAddBuyer = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone || !formData.product) {
      alert('Harap isi semua field yang wajib diisi (*)')
      return
    }
    
    if (editingId) {
      // Update existing buyer
      const updatedBuyers = buyers.map(b =>
        b.id === editingId
          ? {
              ...b,
              name: formData.name,
              phone: formData.phone,
              product: formData.product,
              duration: formData.duration,
              startDate: formData.startDate,
              endDate: formData.endDate,
              remainingDays: calculateRemainingDays(new Date(formData.endDate)),
            }
          : b
      )
      setBuyers(updatedBuyers)
      localStorage.setItem('langgoku_buyers', JSON.stringify(updatedBuyers))
      alert('Data pembeli berhasil diperbarui')
      setEditingId(null)
    } else {
      // Add new buyer
      const newBuyer: Buyer = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        product: formData.product,
        duration: formData.duration,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: 'active',
        remainingDays: calculateRemainingDays(new Date(formData.endDate)),
        notified: false,
      }
      const newBuyers = [...buyers, newBuyer]
      setBuyers(newBuyers)
      localStorage.setItem('langgoku_buyers', JSON.stringify(newBuyers))
      alert('Data pembeli berhasil ditambahkan')
    }

    handleCancelEdit()
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

  const handleDeleteBuyer = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pembeli ini?')) {
      const newBuyers = buyers.filter(b => b.id !== id)
      setBuyers(newBuyers)
      localStorage.setItem('langgoku_buyers', JSON.stringify(newBuyers))
      alert('Data pembeli berhasil dihapus')
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
      
      // Update the buyer as notified
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
                className="btn-primary flex-1"
              >
                {editingId ? 'Update Pembeli' : 'Tambah Pembeli'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
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
