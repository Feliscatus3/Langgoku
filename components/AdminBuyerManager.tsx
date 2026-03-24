'use client'

import { useState, useEffect } from 'react'
import { calculateRemainingDays, getSubscriptionStatus, formatPrice } from '@/lib/googleSheets'

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
  googleSheetId?: string
  paymentMethod?: string
  adminPhone?: string
}

export default function AdminBuyerManager() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [customDurationValue, setCustomDurationValue] = useState('')
  const [customDurationType, setCustomDurationType] = useState<'hari' | 'minggu' | 'bulan'>('hari')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    product: '',
    duration: '1 bulan',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    googleSheetId: '',
    paymentMethod: 'QRIS',
    adminPhone: '',
  })

  const durations = ['1 hari', '2 hari', '3 hari', '1 minggu', '1 bulan', '3 bulan', '6 bulan', '1 tahun']

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
    } else {
      // Handle other formats or invalid input
      start.setMonth(start.getMonth() + 1) // Default to 1 month
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
              googleSheetId: formData.googleSheetId,
              paymentMethod: formData.paymentMethod,
              adminPhone: formData.adminPhone,
              remainingDays: calculateRemainingDays(new Date(formData.endDate)),
            }
          : b
      )
      setBuyers(updatedBuyers)
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
        googleSheetId: formData.googleSheetId,
        paymentMethod: formData.paymentMethod,
        adminPhone: formData.adminPhone,
      }
      setBuyers([...buyers, newBuyer])
    }

    setFormData({
      name: '',
      phone: '',
      product: '',
      duration: '1 bulan',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      googleSheetId: '',
      paymentMethod: 'QRIS',
      adminPhone: '',
    })
    setShowForm(false)
    setShowCustomDuration(false)
  }

  const handleEditBuyer = (buyer: Buyer) => {
    setFormData({
      name: buyer.name,
      phone: buyer.phone,
      product: buyer.product,
      duration: buyer.duration,
      startDate: buyer.startDate,
      endDate: buyer.endDate,
      googleSheetId: buyer.googleSheetId || '',
      paymentMethod: buyer.paymentMethod || 'QRIS',
      adminPhone: buyer.adminPhone || '',
    })
    setEditingId(buyer.id)
    setShowForm(true)
  }

  const handleDeleteBuyer = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pembeli ini?')) {
      setBuyers(buyers.filter(b => b.id !== id))
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      name: '',
      phone: '',
      product: '',
      duration: '1 bulan',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      googleSheetId: '',
      paymentMethod: 'QRIS',
      adminPhone: '',
    })
  }

  const sendReminderNotification = async (buyer: Buyer) => {
    try {
      const message = encodeURIComponent(
        `Halo ${buyer.name}! 👋\n\n⏰ *Pengingat Langganan Langgoku*\n\nLangganan Anda untuk *${buyer.product}* akan berakhir pada:\n📅 ${buyer.endDate}\n\nSisa waktu: *${buyer.remainingDays} hari*\n\nJangan sampai kehabisan! Perpanjang langganan Anda sekarang di www.langgoku.com\n\nTerima kasih telah mempercayai Langgoku! 🚀`
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
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Gagal mengirim pengingat')
    }
  }

  const sendBulkReminders = async () => {
    const expiringBuyers = getExpiringBuyers().filter(b => !b.notified)
    if (expiringBuyers.length === 0) {
      alert('Tidak ada pembeli yang perlu diberitahu')
      return
    }

    if (!confirm(`Kirim pengingat ke ${expiringBuyers.length} pembeli?`)) {
      return
    }

    for (const buyer of expiringBuyers) {
      await new Promise(resolve => setTimeout(resolve, 500)) // Delay to avoid spam
      await sendReminderNotification(buyer)
    }
  }

  const getStatusBadge = (status: string, remainingDays: number) => {
    const badgeClasses: Record<string, string> = {
      active: 'badge-success',
      expiring: 'badge-warning',
      expired: 'badge-danger',
    }

    const statusTexts: Record<string, string> = {
      active: '✓ Aktif',
      expiring: `⚠️ Hampir Habis (${remainingDays} hari)`,
      expired: '✕ Expired',
    }

    return {
      class: badgeClasses[status],
      text: statusTexts[status],
    }
  }

  const getExpiringBuyers = () => {
    const today = new Date()
    return buyers.filter(buyer => {
      const endDate = new Date(buyer.endDate)
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysLeft <= 3 && daysLeft > 0
    })
  }

  const getExpiredBuyers = () => {
    const today = new Date()
    return buyers.filter(buyer => {
      const endDate = new Date(buyer.endDate)
      return endDate < today
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">👥 Manajemen Pembeli</h2>
          <p className="text-gray-600 text-xs md:text-sm mt-2">Kelola semua data pembeli, langganan, dan kirim notifikasi</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingId(null)
              setShowForm(true)
            }}
            className="btn-primary whitespace-nowrap shadow-lg hover:shadow-xl transition-all"
          >
            ➕ Tambah Pembeli
          </button>
        )}
      </div>

      {/* Reminder Alerts */}
      {getExpiredBuyers().length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 md:p-6 mb-6 shadow-sm">
          <h4 className="font-bold text-red-800 mb-3 text-base flex items-center gap-2">
            ⚠️ Langganan Expired ({getExpiredBuyers().length})
          </h4>
          <ul className="space-y-2 text-red-700 text-xs md:text-sm">
            {getExpiredBuyers().map(buyer => (
              <li key={buyer.id} className="flex items-center justify-between gap-2 bg-white/60 p-2 rounded">
                <span className="font-medium">{buyer.name}</span>
                <span className="text-xs bg-red-100 px-2 py-1 rounded border border-red-300">{buyer.endDate}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {getExpiringBuyers().length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 md:p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-start mb-3 gap-4">
            <h4 className="font-bold text-yellow-800 text-base flex items-center gap-2">
              ⏰ Hampir Habis ({getExpiringBuyers().length})
            </h4>
            <button
              onClick={sendBulkReminders}
              className="btn-accent text-xs py-2 px-3 whitespace-nowrap"
              title="Kirim pengingat WhatsApp ke semua pembeli"
            >
              📢 Ingatkan Semua
            </button>
          </div>
          <ul className="space-y-2 text-yellow-700 text-xs md:text-sm">
            {getExpiringBuyers().map(buyer => {
              const daysLeft = Math.ceil((new Date(buyer.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              return (
                <li key={buyer.id} className="flex items-center justify-between gap-2 bg-white/60 p-2 rounded">
                  <span className="flex items-center gap-2 flex-1">
                    <span className="font-medium">{buyer.name} ({buyer.product})</span>
                    <span className="text-xs bg-yellow-100 px-2 py-0.5 rounded font-bold border border-yellow-300">{daysLeft}d</span>
                  </span>
                  <button
                    onClick={() => sendReminderNotification(buyer)}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-300 hover:bg-blue-200 transition-colors whitespace-nowrap"
                  >
                    📱 Ingatkan
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-8 mb-8 border-2 border-purple-300 bg-gradient-to-br from-white to-purple-50 shadow-xl">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            {editingId ? '✏️ Edit Data Pembeli' : '➕ Input Data Pembeli Baru'}
          </h3>
          <form onSubmit={handleAddBuyer} className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">📝 Informasi Pembeli</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field w-full"
                />
                <input
                  type="tel"
                  placeholder="No WhatsApp (contoh: 628123456789)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="input-field w-full"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">🛍️ Informasi Produk & Langganan</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nama Produk (contoh: Netflix Premium)"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  required
                  className="input-field w-full"
                />
                {!showCustomDuration ? (
                  <select
                    value={formData.duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">-- Pilih Durasi --</option>
                    <optgroup label="Pendek (Hari)">
                      <option value="1 hari">1 Hari</option>
                      <option value="2 hari">2 Hari</option>
                      <option value="3 hari">3 Hari</option>
                    </optgroup>
                    <optgroup label="Sedang">
                      <option value="1 minggu">1 Minggu</option>
                      <option value="1 bulan">1 Bulan</option>
                      <option value="3 bulan">3 Bulan</option>
                    </optgroup>
                    <optgroup label="Panjang">
                      <option value="6 bulan">6 Bulan</option>
                      <option value="1 tahun">1 Tahun</option>
                    </optgroup>
                    <optgroup label="Tambahan">
                      <option value="custom">➕ Durasi Custom</option>
                    </optgroup>
                  </select>
                ) : (
                  <div className="flex gap-2">
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
                      onChange={(e) => setCustomDurationType(e.target.value as 'hari' | 'minggu' | 'bulan')}
                      className="input-field flex-1"
                    >
                      <option value="hari">Hari</option>
                      <option value="minggu">Minggu</option>
                      <option value="bulan">Bulan</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">💳 Informasi Pembayaran & Admin</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="QRIS">💳 QRIS</option>
                  <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                  <option value="E_WALLET">📱 E-Wallet</option>
                  <option value="PULSA">📞 Pulsa</option>
                </select>
                <input
                  type="text"
                  placeholder="Google Sheet ID"
                  value={formData.googleSheetId}
                  onChange={(e) => setFormData({ ...formData, googleSheetId: e.target.value })}
                  className="input-field w-full"
                />
                <input
                  type="tel"
                  placeholder="Nomor Admin (WhatsApp)"
                  value={formData.adminPhone}
                  onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">📅 Tanggal Langganan</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  required
                  className="input-field w-full"
                />
                <input
                  type="date"
                  value={formData.endDate}
                  readOnly
                  className="input-field w-full bg-gray-100"
                  disabled
                />
              </div>
            </div>

            {/* Custom Duration Buttons */}
            {showCustomDuration && (
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleCustomDurationApply}
                  className="btn-accent flex-1"
                >
                  ✓ Terapkan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomDuration(false)
                    setCustomDurationValue('')
                    setCustomDurationType('hari')
                  }}
                  className="btn-secondary flex-1"
                >
                  ✕ Batal
                </button>
              </div>
            )}

            {/* Form Buttons */}
            {!showCustomDuration && (
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button type="submit" className="btn-primary flex-1 shadow-lg hover:shadow-xl">
                  {editingId ? '✓ Update Pembeli' : '✓ Tambah Pembeli'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-secondary flex-1"
                >
                  ✕ Batal
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Buyers List */}
      {buyers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 text-lg font-medium">Belum ada data pembeli</p>
          <p className="text-gray-500 text-sm mt-2">Klik tombol &quot;Tambah Pembeli&quot; untuk memulai</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-300 shadow-lg bg-white">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <tr>
                <th className="px-4 py-4 text-left font-semibold text-sm">👤 Nama</th>
                <th className="px-4 py-4 text-left font-semibold text-sm hidden lg:table-cell">📱 No WA</th>
                <th className="px-4 py-4 text-left font-semibold text-sm">🛍️ Produk</th>
                <th className="px-4 py-4 text-left font-semibold text-sm hidden md:table-cell">⏱️ Durasi</th>
                <th className="px-4 py-4 text-left font-semibold text-sm hidden xl:table-cell">📅 Mulai</th>
                <th className="px-4 py-4 text-left font-semibold text-sm">📆 Selesai</th>
                <th className="px-4 py-4 text-left font-semibold text-sm">📊 Status</th>
                <th className="px-4 py-4 text-center font-semibold text-sm">⚙️ Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {buyers.map((buyer) => {
                const statusBadge = getStatusBadge(buyer.status, buyer.remainingDays)
                return (
                  <tr key={buyer.id} className="hover:bg-gradient-to-r hover:from-purple-50 to-pink-50 transition-colors duration-300 group">
                    <td className="px-4 py-4 text-gray-900 font-bold text-sm group-hover:text-purple-700">{buyer.name}</td>
                    <td className="px-4 py-4 text-gray-600 text-sm hidden lg:table-cell font-mono">{buyer.phone}</td>
                    <td className="px-4 py-4 text-gray-600 text-sm font-medium">{buyer.product}</td>
                    <td className="px-4 py-4 text-gray-600 text-sm hidden md:table-cell">{buyer.duration}</td>
                    <td className="px-4 py-4 text-gray-600 text-sm hidden xl:table-cell">{buyer.startDate}</td>
                    <td className="px-4 py-4 text-gray-900 text-sm font-semibold">{buyer.endDate}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditBuyer(buyer)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all text-sm font-bold"
                          title="Edit pembeli"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteBuyer(buyer.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all text-sm font-bold hover:scale-110"
                          title="Hapus data pembeli ini"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
