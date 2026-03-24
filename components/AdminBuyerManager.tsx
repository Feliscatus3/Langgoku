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
}

export default function AdminBuyerManager() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    product: '',
    duration: '1 bulan',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })

  const durations = ['1 bulan', '3 bulan', '6 bulan', '1 tahun']

  const calculateEndDate = (startDate: string, duration: string) => {
    const start = new Date(startDate)
    const months = parseInt(duration)
    start.setMonth(start.getMonth() + months)
    return start.toISOString().split('T')[0]
  }

  const handleDurationChange = (duration: string) => {
    setFormData({
      ...formData,
      duration,
      endDate: calculateEndDate(formData.startDate, duration),
    })
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

  const getStatusBadge = (status: string, remainingDays: number) => {
    const badgeClasses: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      expiring: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
    }

    const statusTexts: Record<string, string> = {
      active: 'Aktif',
      expiring: `Hampir Habis (${remainingDays} hari)`,
      expired: 'Expired',
    }

    return {
      class: badgeClasses[status],
      text: statusTexts[status],
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Pembeli</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          + Tambah Pembeli
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Input Data Pembeli</h3>
          <form onSubmit={handleAddBuyer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nama"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input-field"
              />
              <input
                type="tel"
                placeholder="No WhatsApp"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="input-field"
              />
              <input
                type="text"
                placeholder="Produk"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                required
                className="input-field"
              />
              <select
                value={formData.duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="input-field"
              >
                {durations.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
                className="input-field"
              />
              <input
                type="date"
                value={formData.endDate}
                readOnly
                className="input-field"
                disabled
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buyers List */}
      {buyers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Belum ada data pembeli</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Nama</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">No WA</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Produk</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Durasi</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Tanggal Mulai</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Tanggal Selesai</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {buyers.map((buyer) => {
                const statusBadge = getStatusBadge(buyer.status, buyer.remainingDays)
                return (
                  <tr key={buyer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-semibold">{buyer.name}</td>
                    <td className="px-4 py-3 text-gray-600">{buyer.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{buyer.product}</td>
                    <td className="px-4 py-3 text-gray-600">{buyer.duration}</td>
                    <td className="px-4 py-3 text-gray-600">{buyer.startDate}</td>
                    <td className="px-4 py-3 text-gray-600">{buyer.endDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
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
