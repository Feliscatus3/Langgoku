'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { formatPrice } from '@/lib/googleSheets'

interface ProductVariant {
  id: string
  productId: string
  name: string
  durationDays: number
  price: number
  status: 'active' | 'inactive'
  sortOrder: number
}

interface Product {
  id: string
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  description?: string
  variants?: ProductVariant[]
}

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

interface ConfirmModalProps {
  title: string
  message: string
  confirmText: string
  cancelText: string
  type: 'add' | 'edit' | 'delete'
  onConfirm: () => void
  onCancel: () => void
}

// SWR fetcher with no cache
const fetcher = (url: string) => fetch(url, {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
}).then(res => res.json())

const variantFetcher = (url: string) => fetch(url, {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
}).then(res => res.json())

function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">
          {type === 'success' ? '✓' : '✕'}
        </span>
        <p className="font-medium">{message}</p>
        <button onClick={onClose} className="ml-4 text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  )
}

function ConfirmModal({ title, message, confirmText, cancelText, type, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition-colors ${
              type === 'delete' 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProductManager() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    type: 'add' | 'edit' | 'delete'
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    duration: '',
    stock: 0,
    image: '',
    description: ''
  })
  // Variant management state
  const [showVariants, setShowVariants] = useState<string | null>(null)
  const [variantFormData, setVariantFormData] = useState<Partial<ProductVariant>>({
    name: '',
    durationDays: 1,
    price: 0,
    status: 'active'
  })
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null)
  const [variantSubmitting, setVariantSubmitting] = useState(false)
  const [variantToast, setVariantToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Use SWR for real-time data fetching
  // revalidateOnFocus: true - auto-refresh when user focuses on the page
  // revalidateOnReconnect: true - auto-refresh when reconnecting
  // refreshInterval: 3000 - refresh every 3 seconds
  const { data, error, isLoading, mutate } = useSWR('/api/products', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 3000, // Refresh every 3 seconds for near real-time
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  })

  const products: Product[] = data?.data || []

  // Fetch variants for the currently selected product
  const { data: variantData, mutate: mutateVariants } = useSWR(
    showVariants ? `/api/products/${showVariants}/variants` : null,
    variantFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 3000,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    }
  )

  const variants: ProductVariant[] = variantData?.data || []

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  const showVariantToast = (message: string, type: 'success' | 'error') => {
    setVariantToast({ message, type })
  }

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.duration || formData.stock == null) {
      showToast('Harap isi semua field yang diperlukan (*)', 'error')
      return
    }

    setConfirmModal({
      show: true,
      type: 'add',
      title: 'Tambah Produk',
      message: `Apakah Anda yakin ingin menambahkan produk "${formData.name}"?`,
      onConfirm: async () => {
        setConfirmModal(null)
        await executeAddProduct()
      }
    })
  }

  const executeAddProduct = async () => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      
      if (result.success) {
        showToast('Produk berhasil ditambahkan', 'success')
        mutate() // Trigger SWR to re-fetch data immediately
        resetForm()
      } else {
        showToast('Gagal menambahkan produk: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error adding product:', err)
      showToast('Terjadi kesalahan saat menambahkan produk', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingId) return

    setConfirmModal({
      show: true,
      type: 'edit',
      title: 'Edit Produk',
      message: `Apakah Anda yakin ingin memperbarui produk "${formData.name}"?`,
      onConfirm: async () => {
        setConfirmModal(null)
        await executeUpdateProduct()
      }
    })
  }

  const executeUpdateProduct = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/products/${editingId}/update-delete`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      
      if (result.success) {
        showToast('Produk berhasil diperbarui', 'success')
        mutate() // Trigger SWR to re-fetch data immediately
        resetForm()
      } else {
        showToast('Gagal memperbarui produk: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error updating product:', err)
      showToast('Terjadi kesalahan saat memperbarui produk', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    setConfirmModal({
      show: true,
      type: 'delete',
      title: 'Hapus Produk',
      message: `Apakah Anda yakin ingin menghapus produk "${name}"? Data yang dihapus tidak dapat dikembalikan.`,
      onConfirm: async () => {
        setConfirmModal(null)
        await executeDeleteProduct(id)
      }
    })
  }

  const executeDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}/update-delete`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      })
      const result = await response.json()
      
      if (result.success) {
        showToast('Produk berhasil dihapus', 'success')
        mutate() // Trigger SWR to re-fetch data immediately
      } else {
        showToast('Gagal menghapus produk: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      showToast('Terjadi kesalahan saat menghapus produk', 'error')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData(product)
    setShowForm(true)
  }

  const handleRefresh = () => {
    mutate() // Manually trigger SWR to re-fetch
  }

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      name: '',
      price: 0,
      duration: '',
      stock: 0,
      image: '',
      description: ''
    })
  }

  // Variant management functions
  const handleShowVariants = (productId: string) => {
    if (showVariants === productId) {
      setShowVariants(null)
      setEditingVariantId(null)
      setVariantFormData({ name: '', durationDays: 1, price: 0, status: 'active' })
    } else {
      setShowVariants(productId)
      setEditingVariantId(null)
      setVariantFormData({ name: '', durationDays: 1, price: 0, status: 'active' })
    }
  }

  const handleAddVariant = async () => {
    if (!showVariants) return
    if (!variantFormData.name || !variantFormData.durationDays || !variantFormData.price) {
      showVariantToast('Harap isi semua field varian (*)', 'error')
      return
    }

    setVariantSubmitting(true)
    try {
      const response = await fetch(`/api/products/${showVariants}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: variantFormData.name,
          durationDays: variantFormData.durationDays,
          price: variantFormData.price,
          status: variantFormData.status
        })
      })
      const result = await response.json()
      
      if (result.success) {
        showVariantToast('Varian berhasil ditambahkan', 'success')
        mutateVariants()
        resetVariantForm()
      } else {
        showVariantToast('Gagal menambahkan varian: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error adding variant:', err)
      showVariantToast('Terjadi kesalahan saat menambahkan varian', 'error')
    } finally {
      setVariantSubmitting(false)
    }
  }

  const handleUpdateVariant = async () => {
    if (!showVariants || !editingVariantId) return

    setVariantSubmitting(true)
    try {
      const response = await fetch(`/api/products/${showVariants}/variants/${editingVariantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: variantFormData.name,
          durationDays: variantFormData.durationDays,
          price: variantFormData.price,
          status: variantFormData.status
        })
      })
      const result = await response.json()
      
      if (result.success) {
        showVariantToast('Varian berhasil diperbarui', 'success')
        mutateVariants()
        resetVariantForm()
      } else {
        showVariantToast('Gagal memperbarui varian: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error updating variant:', err)
      showVariantToast('Terjadi kesalahan saat memperbarui varian', 'error')
    } finally {
      setVariantSubmitting(false)
    }
  }

  const handleDeleteVariant = async (variantId: string, variantName: string) => {
    if (!showVariants) return

    setConfirmModal({
      show: true,
      type: 'delete',
      title: 'Hapus Varian',
      message: `Apakah Anda yakin ingin menghapus varian "${variantName}"?`,
      onConfirm: async () => {
        setConfirmModal(null)
        await executeDeleteVariant(variantId)
      }
    })
  }

  const executeDeleteVariant = async (variantId: string) => {
    if (!showVariants) return
    try {
      const response = await fetch(`/api/products/${showVariants}/variants/${variantId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json()
      
      if (result.success) {
        showVariantToast('Varian berhasil dihapus', 'success')
        mutateVariants()
      } else {
        showVariantToast('Gagal menghapus varian: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error deleting variant:', err)
      showVariantToast('Terjadi kesalahan saat menghapus varian', 'error')
    }
  }

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariantId(variant.id)
    setVariantFormData({
      name: variant.name,
      durationDays: variant.durationDays,
      price: variant.price,
      status: variant.status
    })
  }

  const resetVariantForm = () => {
    setEditingVariantId(null)
    setVariantFormData({
      name: '',
      durationDays: 1,
      price: 0,
      status: 'active'
    })
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-blue-600 font-medium">Memuat produk...</div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-red-600 font-medium">Gagal memuat produk</div>
    </div>
  )

  return (
    <div className="overflow-x-auto">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Confirmation Modal */}
      {confirmModal?.show && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.type === 'delete' ? 'Ya, Hapus' : 'Ya, Simpan'}
          cancelText="Batal"
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 mb-1">Manajemen Produk</h2>
          <p className="text-gray-600 text-sm">Kelola catalog produk premium Anda</p>
        </div>
        <div className="flex w-full sm:w-auto gap-2 overflow-x-auto">
          <button
            onClick={handleRefresh}
            className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm"
          >
            <span className="text-sm sm:text-base">🔄</span>
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">↻</span>
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary whitespace-nowrap text-sm px-3 sm:px-4 py-2"
            >
              + Tambah Produk
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-4 md:p-8 mb-8 shadow-lg border border-gray-200">
          <h3 className="text-xl md:text-2xl font-bold text-gray-950 mb-4 md:mb-6">
            {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Netflix Premium 4K"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga (IDR) *
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 99000"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi Langganan *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 1 Bulan"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok *
                </label>
                <input
                  type="number"
                  placeholder="Jumlah stok"
                  value={formData.stock || 0}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Gambar
              </label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg atau /images/foto/nama-file.jpg"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="input-field w-full"
              />
              <p className="text-gray-500 text-xs mt-1">Gunakan foto yang ada di public/images/foto/</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Produk
              </label>
              <textarea
                placeholder="Deskripsi detail produk..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="input-field w-full"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={editingId ? handleUpdateProduct : handleAddProduct}
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? 'Menyimpan...' : (editingId ? 'Update Produk' : 'Tambah Produk')}
              </button>
              <button
                onClick={resetForm}
                disabled={submitting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">Belum ada produk</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Tambah Produk Pertama
          </button>
        </div>
) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="card p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                {product.image && (
                  <div className="w-full h-32 md:h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="font-bold text-base md:text-lg text-gray-950 mb-2 truncate">{product.name}</h3>
                <div className="space-y-1 md:space-y-2 mb-3 md:mb-4 text-xs md:text-sm text-gray-600">
                  <p>Harga: <span className="font-semibold text-gray-950">{formatPrice(product.price)}</span></p>
                  <p>Durasi: {product.duration}</p>
                  <p>Stok: {product.stock}</p>
                </div>
                {product.description && (
                  <p className="text-xs text-gray-600 mb-3 md:mb-4 line-clamp-2">{product.description}</p>
                )}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => handleShowVariants(product.id)}
                    className={`flex-1 px-2 md:px-3 py-2 rounded text-xs md:text-sm font-medium transition-colors ${
                      showVariants === product.id
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {showVariants === product.id ? 'Tutup Varian' : 'Kelola Varian'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-2 md:px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs md:text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="flex-1 px-2 md:px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs md:text-sm font-medium transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
          {showVariants && (
        <div className="card p-4 md:p-8 mb-8 shadow-lg border border-gray-200 mt-8" style={{ animation: 'slideDown 0.3s ease' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-950">Manajemen Varian</h3>
            <button
              onClick={() => handleShowVariants(showVariants)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕ Tutup
            </button>
          </div>
          
          {/* Variant Toast */}
          {variantToast && (
            <Toast 
              message={variantToast.message} 
              type={variantToast.type} 
              onClose={() => setVariantToast(null)} 
            />
          )}

          {/* Add/Edit Variant Form */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-950 mb-4">
              {editingVariantId ? 'Edit Varian' : 'Tambah Varian Baru'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Varian *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 1 Hari, 7 Hari, 30 Hari"
                  value={variantFormData.name || ''}
                  onChange={(e) => setVariantFormData({ ...variantFormData, name: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi (Hari) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Contoh: 1, 7, 30"
                  value={variantFormData.durationDays || 1}
                  onChange={(e) => setVariantFormData({ ...variantFormData, durationDays: parseInt(e.target.value) || 1 })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga (IDR) *
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 1000"
                  value={variantFormData.price || 0}
                  onChange={(e) => setVariantFormData({ ...variantFormData, price: parseInt(e.target.value) || 0 })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={variantFormData.status || 'active'}
                  onChange={(e) => setVariantFormData({ ...variantFormData, status: e.target.value as 'active' | 'inactive' })}
                  className="input-field w-full"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={editingVariantId ? handleUpdateVariant : handleAddVariant}
                disabled={variantSubmitting}
                className="btn-primary flex-1"
              >
                {variantSubmitting ? 'Menyimpan...' : (editingVariantId ? 'Update Varian' : 'Tambah Varian')}
              </button>
              {editingVariantId && (
                <button
                  onClick={resetVariantForm}
                  disabled={variantSubmitting}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          {/* Variants List */}
          {variants.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-4">Belum ada varian untuk produk ini</p>
              <p className="text-sm text-gray-500">Klik "Tambah Varian Baru" di atas untuk menambahkan pilihan masa berlaku</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-950 mb-3">Daftar Varian</h4>
              {variants.map((variant) => {
              return (
                <div key={variant.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-950">{variant.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        variant.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {variant.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <span className="text-sm text-gray-500">Urutan: {variant.sortOrder}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Durasi: <span className="font-medium text-gray-950">{variant.durationDays} Hari</span></span>
                      <span>Harga: <span className="font-semibold text-blue-600">{formatPrice(variant.price)}</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-nowrap">
                    <button
                      onClick={() => handleEditVariant(variant)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium transition-colors whitespace-nowrap"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVariant(variant.id, variant.name)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium transition-colors whitespace-nowrap"
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
        </div>
      )}
    </div>
  )
}