'use client'

import { useState, useEffect } from 'react'

interface PromoAd {
  ID: string
  'URL Gambar': string
  Judul: string
  Deskripsi: string
  'URL Link': string
  Aktif: boolean
  'Tanggal Dibuat': string
}

export default function AdminPromoAds() {
  const [promoAds, setPromoAds] = useState<PromoAd[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAd, setEditingAd] = useState<PromoAd | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    linkUrl: '',
    isActive: true
  })

  useEffect(() => {
    loadPromoAds()
  }, [])

  const loadPromoAds = async () => {
    try {
      const response = await fetch('/api/promo-ads')
      const data = await response.json()
      if (data.success) {
        setPromoAds(data.data || [])
      }
    } catch (err) {
      console.error('Error loading promo ads:', err)
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
      const url = editingAd 
        ? `/api/promo-ads?id=${editingAd.ID}`
        : '/api/promo-ads'
      
      const method = editingAd ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(editingAd ? 'Iklan promo berhasil diperbarui!' : 'Iklan promo berhasil ditambahkan!')
        setShowAddForm(false)
        setEditingAd(null)
        resetForm()
        loadPromoAds()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.message || 'Gagal menyimpan iklan promo')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (ad: PromoAd) => {
    setEditingAd(ad)
    setFormData({
      imageUrl: ad['URL Gambar'],
      title: ad.Judul || '',
      description: ad.Deskripsi || '',
      linkUrl: ad['URL Link'] || '',
      isActive: ad.Aktif !== false
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus iklan promo ini?')) return

    try {
      const response = await fetch(`/api/promo-ads?id=${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()

      if (result.success) {
        setSuccess('Iklan promo berhasil dihapus!')
        loadPromoAds()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.message || 'Gagal menghapus iklan promo')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghapus')
    }
  }

  const handleToggleActive = async (ad: PromoAd) => {
    try {
      const response = await fetch(`/api/promo-ads?id=${ad.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: ad.Aktif === false })
      })
      const result = await response.json()

      if (result.success) {
        loadPromoAds()
      }
    } catch (err) {
      console.error('Error toggling ad status:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      title: '',
      description: '',
      linkUrl: '',
      isActive: true
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-medium text-gray-950">Iklan Promo</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola iklan promo dengan gambar 1080x1350</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingAd(null); resetForm() }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Tambah Iklan
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
            {editingAd ? 'Edit Iklan Promo' : 'Tambah Iklan Promo Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Gambar (1080x1350) *
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://contoh.com/gambar.jpg"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Rekomendasi ukuran: 1080 x 1350 piksel
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Judul iklan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi iklan"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Link (opsional)
              </label>
              <input
                type="url"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="https://contoh.com/produk"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Aktifkan iklan
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : (editingAd ? 'Simpan Perubahan' : 'Tambah Iklan')}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setEditingAd(null); resetForm() }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promo Ads Grid */}
      {promoAds.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-500">Belum ada iklan promo. Klik tombol "Tambah Iklan" untuk membuat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promoAds.map((ad) => (
            <div key={ad.ID} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Image Preview */}
              <div className="aspect-[4/5] bg-gray-100 relative">
                {ad['URL Gambar'] ? (
                  <img 
                    src={ad['URL Gambar']} 
                    alt={ad.Judul || 'Iklan promo'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Tidak ada gambar
                  </div>
                )}
                {/* Active Badge */}
                {ad.Aktif !== false && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                    Aktif
                  </span>
                )}
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900 truncate">
                  {ad.Judul || 'Tanpa judul'}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {ad.Deskripsi || 'Tidak ada deskripsi'}
                </p>
                {ad['URL Link'] && (
                  <p className="text-xs text-blue-500 mt-2 truncate">
                    Link: {ad['URL Link']}
                  </p>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleActive(ad)}
                    className={`text-sm ${ad.Aktif !== false ? 'text-amber-600' : 'text-green-600'}`}
                  >
                    {ad.Aktif !== false ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ad.ID)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}