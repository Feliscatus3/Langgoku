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
}

export default function AdminBuyerManager() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [showForm, setShowForm] = useState(false)
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

    setBuyers([...buyers, newBuyer])
    setFormData({
      name: '',
      phone: '',
      product: '',
      duration: '1 bulan',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    })
    setShowForm(false)
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gradient">👥 Manajemen Pembeli</h2>
          <p className="text-primary-600 text-sm mt-1">Kelola semua data pembeli dan langganan</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          + Tambah Pembeli
        </button>
      </div>

      {/* Reminder Alerts */}
      {getExpiredBuyers().length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-bold text-red-700 text-lg flex items-center gap-2">
              ⚠️ Pembeli dengan Langganan Expired ({getExpiredBuyers().length})
            </h4>
          </div>
          <ul className="space-y-2 text-red-700 text-sm">
            {getExpiredBuyers().map(buyer => (
              <li key={buyer.id} className="flex items-center justify-between gap-2 bg-white/50 p-2 rounded">
                <span className="flex items-center gap-2">
                  • {buyer.name}
                  <span className="text-xs bg-red-100 px-2 py-1 rounded border border-red-300">Kadaluarsa: {buyer.endDate}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {getExpiringBuyers().length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-bold text-yellow-700 text-lg flex items-center gap-2">
              ⏰ Pembeli dengan Langganan Hampir Habis ({getExpiringBuyers().length})
            </h4>
            <button
              onClick={sendBulkReminders}
              className="btn-accent text-sm py-2 px-4"
              title="Kirim pengingat WhatsApp ke semua pembeli"
            >
              📢 Kirim Pengingat
            </button>
          </div>
          <ul className="space-y-3 text-yellow-700 text-sm">
            {getExpiringBuyers().map(buyer => {
              const daysLeft = Math.ceil((new Date(buyer.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              const isNotified = buyer.notified
              return (
                <li key={buyer.id} className="flex items-center justify-between gap-2 bg-white/50 p-3 rounded border border-yellow-200">
                  <span className="flex items-center gap-2 flex-1">
                    • {buyer.name} ({buyer.product})
                    <span className="text-xs bg-yellow-100 px-2 py-1 rounded font-bold border border-yellow-300">{daysLeft} hari lagi</span>
                    {isNotified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300">
                        ✓ Sudah diberitahu
                      </span>
                    )}
                  </span>
                  {!isNotified && (
                    <button
                      onClick={() => sendReminderNotification(buyer)}
                      className="btn-accent text-xs py-1.5 px-3 whitespace-nowrap"
                      title={`Kirim pengingat ke ${buyer.name}`}
                    >
                      📱 Ingatkan
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-8 mb-8 border border-accent-200">
          <h3 className="text-2xl font-bold text-gradient mb-6">➕ Input Data Pembeli</h3>
          <form onSubmit={handleAddBuyer} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nama"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input-field w-full"
              />
              <input
                type="tel"
                placeholder="No WhatsApp"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="input-field w-full"
              />
              <input
                type="text"
                placeholder="Produk"
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
                <div className="flex gap-2 md:col-span-1">
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
              {!showCustomDuration && (
                <>
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
                    className="input-field w-full"
                    disabled
                  />
                </>
              )}
            </div>
            {!showCustomDuration && (
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  ✓ Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-primary-600 text-lg font-medium">Belum ada data pembeli</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-primary-200 shadow-lg">
          <table className="w-full">
            <thead className="bg-gradient-primary text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-sm">Nama</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">No WA</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Produk</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Durasi</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Tanggal Mulai</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Tanggal Selesai</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-sm">Notifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {buyers.map((buyer) => {
                const statusBadge = getStatusBadge(buyer.status, buyer.remainingDays)
                return (
                  <tr key={buyer.id} className="hover:bg-primary-50 transition-colors duration-300">
                    <td className="px-6 py-4 text-primary-900 font-semibold">{buyer.name}</td>
                    <td className="px-6 py-4 text-primary-600">{buyer.phone}</td>
                    <td className="px-6 py-4 text-primary-600">{buyer.product}</td>
                    <td className="px-6 py-4 text-primary-600">{buyer.duration}</td>
                    <td className="px-6 py-4 text-primary-600">{buyer.startDate}</td>
                    <td className="px-6 py-4 text-primary-600">{buyer.endDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-2 rounded-full text-xs font-semibold ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {buyer.notified ? (
                        <span className="text-xs bg-green-100 text-green-800 px-3 py-2 rounded-full font-semibold border border-green-300">
                          ✓ Sudah diberitahu
                        </span>
                      ) : buyer.remainingDays <= 3 && buyer.remainingDays > 0 ? (
                        <button
                          onClick={() => sendReminderNotification(buyer)}
                          className="text-xs bg-blue-100 text-blue-800 px-3 py-2 rounded-full font-semibold border border-blue-300 hover:bg-blue-200 transition-colors"
                        >
                          📱 Ingatkan
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
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
