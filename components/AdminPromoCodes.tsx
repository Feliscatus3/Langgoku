'use client'

import { useState, useEffect } from 'react'

interface PromoCode {
  ID: string
  'Kode Promo': string
  Diskon: number
  'Tipe Diskon': string
  Deskripsi: string
  'Batas Penggunaan': number
  'Penggunaan Saat Ini': number
  'Minimal Pembelian': number
  'Maksimal Diskon': number
  'Tanggal Kadaluarsa': string
  Status: string
  'Tanggal Dibuat': string
}

export default function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    code: '',
    discount: 0,
    discountType: 'percentage',
    description: '',
    usageLimit: 0,
    minPurchase: 0,
    maxDiscount: 0,
    expiryDate: '',
    status: 'Aktif'
  })

  useEffect(() => {
    loadPromoCodes()
  }, [])

  const loadPromoCodes = async () => {
    try {
      const response = await fetch('/api/promo-codes')
      const data = await response.json()
      if (data.success) {
        setPromoCodes(data.data || [])
      }
    } catch (err) {
      console.error('Error loading promo codes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const url = editingPromo 
        ? `/api/promo-codes?id=${editingPromo.ID}`
        : '/api/promo-codes'
      
      const method = editingPromo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(editingPromo ? 'Kode promo berhasil diperbarui!' : 'Kode promo berhasil ditambahkan!')
        setShowAddForm(false)
        setEditingPromo(null)
        resetForm()
        loadPromoCodes()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.message || 'Gagal menyimpan kode promo')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo)
    setFormData({
      code: promo['Kode Promo'],
      discount: promo.Diskon,
      discountType: promo['Tipe Diskon'] || 'percentage',
      description: promo.Deskripsi || '',
      usageLimit: promo['Batas Penggunaan'] || 0,
      minPurchase: promo['Minimal Pembelian'] || 0,
      maxDiscount: promo['Maksimal Diskon'] || 0,
      expiryDate: promo['Tanggal Kadaluarsa'] || '',
      status: promo.Status || 'Aktif'
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kode promo ini?')) return

    try {
      const response = await fetch(`/api/promo-codes?id=${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()

      if (result.success) {
        setSuccess('Kode promo berhasil dihapus!')
        loadPromoCodes()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.message || 'Gagal menghapus kode promo')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghapus')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      discount: 0,
      discountType: 'percentage',
      description: '',
      usageLimit: 0,
      minPurchase: 0,
      maxDiscount: 0,
      expiryDate: '',
      status: 'Aktif'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-950">Kode Promo</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola kode promo dan diskon</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingPromo(null); resetForm() }}
          className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
        >
          + Tambah Kode Promo
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingPromo ? 'Edit Kode Promo' : 'Tambah Kode Promo Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Promo *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="DISKON10"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Diskon
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="percentage">Persen (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diskon *
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  placeholder={formData.discountType === 'percentage' ? '10' : '10000'}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batas Penggunaan (0 = tidak terbatas)
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimal Pembelian (Rp)
                </label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimal Diskon (Rp)
                </label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Kadaluarsa
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Contoh: Diskon 10% untuk semua produk"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : (editingPromo ? 'Simpan Perubahan' : 'Tambah Kode Promo')}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setEditingPromo(null); resetForm() }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promo Codes Table */}
      {promoCodes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center">
          <p className="text-gray-500">Belum ada kode promo. Klik tombol "Tambah Kode Promo" untuk membuat.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto -mx-2 md:mx-0">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden min-w-[600px]">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-600">Kode</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-600">Diskon</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-600 hidden sm:table-cell">Min. Belanja</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-600 hidden md:table-cell">Batas</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-600">Kadaluarsa</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-600">Status</th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promoCodes.map((promo) => (
                  <tr key={promo.ID} className="hover:bg-gray-50">
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span className="font-medium text-blue-600 text-xs md:text-sm">{promo['Kode Promo']}</span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                      {promo['Tipe Diskon'] === 'percentage' 
                        ? `${promo.Diskon}%`
                        : `Rp ${promo.Diskon.toLocaleString('id-ID')}`}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600 text-xs md:text-sm hidden sm:table-cell">
                      Rp {promo['Minimal Pembelian']?.toLocaleString('id-ID') || 0}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600 text-xs md:text-sm hidden md:table-cell">
                      {promo['Batas Penggunaan'] > 0 
                        ? `${promo['Penggunaan Saat Ini'] || 0}/${promo['Batas Penggunaan']}`
                        : '∞'}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-gray-600 text-xs md:text-sm">
                      {promo['Tanggal Kadaluarsa'] ? new Date(promo['Tanggal Kadaluarsa']).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        promo.Status === 'Aktif' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {promo.Status}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-2 md:py-3 text-right">
                      <button
                        onClick={() => handleEdit(promo)}
                        className="text-blue-600 hover:text-blue-800 mr-2 md:mr-3 text-xs md:text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(promo.ID)}
                        className="text-red-600 hover:text-red-800 text-xs md:text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}