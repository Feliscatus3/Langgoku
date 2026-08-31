'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { formatPrice } from '@/lib/googleSheets'

// New Shopee-like variant types
interface VariantAttribute {
  id: string
  productId: string
  name: string
  sortOrder: number
  status: 'active' | 'inactive'
}

interface AttributeOption {
  id: string
  attributeId: string
  name: string
  sortOrder: number
  status: 'active' | 'inactive'
}

interface VariantCombination {
  id: string
  productId: string
  price: number
  status: 'active' | 'inactive'
  sortOrder: number
  options: Record<string, string> // attributeId -> optionId
}

interface Product {
  id: string
  name: string
  price: number
  image?: string
  description?: string
  variantAttributes?: VariantAttribute[]
  attributeOptions?: AttributeOption[]
  variantCombinations?: VariantCombination[]
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
    image: '',
    description: ''
  })
  // Variant management state
  const [showVariants, setShowVariants] = useState<string | null>(null)
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null)
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null)
  const [attributeFormData, setAttributeFormData] = useState<Partial<VariantAttribute>>({
    name: '',
    status: 'active'
  })
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null)
  const [optionFormData, setOptionFormData] = useState<Partial<AttributeOption>>({
    name: '',
    status: 'active'
  })
  const [editingCombinationId, setEditingCombinationId] = useState<string | null>(null)
  const [combinationFormData, setCombinationFormData] = useState<Partial<VariantCombination>>({
    price: 0,
    status: 'active',
    options: {} as Record<string, string>
  })
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

  // SWR for variant data
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

  // Parse variant data
  const attributes: VariantAttribute[] = variantData?.attributes || []
  const attributeOptions: AttributeOption[] = variantData?.options || []
  const combinations: VariantCombination[] = variantData?.combinations || []

  // Use SWR for real-time data fetching
  // revalidateOnFocus: true - auto-refresh when user focuses on the page
  // revalidateOnReconnect: true - auto-refresh when reconnecting
  // refreshInterval: 3000 - refresh every 3 seconds

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  const showVariantToast = (message: string, type: 'success' | 'error') => {
    setVariantToast({ message, type })
  }

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price) {
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
      image: '',
      description: ''
    })
  }

  // ===== NEW VARIANT SYSTEM FUNCTIONS =====
  const handleShowVariants = (productId: string) => {
    if (showVariants === productId) {
      setShowVariants(null)
      setSelectedAttributeId(null)
    } else {
      setShowVariants(productId)
      setSelectedAttributeId(null)
    }
  }

  // Attribute functions
  const handleAddAttribute = async () => {
    if (!showVariants || !attributeFormData.name) return
    setVariantSubmitting(true)
    try {
      const response = await fetch(`/api/products/${showVariants}/attributes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: attributeFormData.name, status: attributeFormData.status })
      })
      const result = await response.json()
      if (result.success) {
        showVariantToast('Atribut berhasil ditambahkan', 'success')
        mutateVariants()
        resetAttributeForm()
      } else {
        showVariantToast('Gagal menambahkan atribut: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error adding attribute:', err)
      showVariantToast('Terjadi kesalahan saat menambahkan atribut', 'error')
    } finally {
      setVariantSubmitting(false)
    }
  }

  const handleUpdateAttribute = async () => {
    if (!showVariants || !editingAttributeId) return
    setVariantSubmitting(true)
    try {
      const response = await fetch(`/api/products/${showVariants}/attributes/${editingAttributeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: attributeFormData.name, status: attributeFormData.status })
      })
      const result = await response.json()
      if (result.success) {
        showVariantToast('Atribut berhasil diperbarui', 'success')
        mutateVariants()
        resetAttributeForm()
      } else {
        showVariantToast('Gagal memperbarui atribut: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error updating attribute:', err)
      showVariantToast('Terjadi kesalahan saat memperbarui atribut', 'error')
    } finally {
      setVariantSubmitting(false)
    }
  }

  const handleDeleteAttribute = async (id: string, name: string) => {
    if (!showVariants) return
    setConfirmModal({
      show: true,
      type: 'delete',
      title: 'Hapus Atribut',
      message: `Apakah Anda yakin ingin menghapus atribut "${name}"?`,
      onConfirm: async () => {
        setConfirmModal(null)
        await executeDeleteAttribute(id)
      }
    })
  }

  const executeDeleteAttribute = async (id: string) => {
    if (!showVariants) return
    try {
      const response = await fetch(`/api/products/${showVariants}/attributes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json()
      if (result.success) {
        showVariantToast('Atribut berhasil dihapus', 'success')
        mutateVariants()
      } else {
        showVariantToast('Gagal menghapus atribut: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error deleting attribute:', err)
      showVariantToast('Terjadi kesalahan saat menghapus atribut', 'error')
    }
  }

  const handleEditAttribute = (attr: VariantAttribute) => {
    setEditingAttributeId(attr.id)
    setAttributeFormData({ name: attr.name, status: attr.status })
  }

  const resetAttributeForm = () => {
    setEditingAttributeId(null)
    setAttributeFormData({ name: '', status: 'active' })
  }

  const handleShowAttributeOptions = (attributeId: string) => {
    if (selectedAttributeId === attributeId) {
      setSelectedAttributeId(null)
    } else {
      setSelectedAttributeId(attributeId)
    }
  }

  // Option functions
  const handleAddOption = async () => {
    if (!selectedAttributeId || !optionFormData.name) return
    setVariantSubmitting(true)
    try {
      const response = await fetch(`/api/attributes/${selectedAttributeId}/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: optionFormData.name, status: optionFormData.status })
      })
      const result = await response.json()
      if (result.success) {
        showVariantToast('Opsi berhasil ditambahkan', 'success')
        mutateVariants()
        resetOptionForm()
      } else {
        showVariantToast('Gagal menambahkan opsi: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error adding option:', err)
      showVariantToast('Terjadi kesalahan saat menambahkan opsi', 'error')
    } finally {
      setVariantSubmitting(false)
    }
  }

  const handleUpdateOption = async () => {
    if (!editingOptionId) return
    setVariantSubmitting(true)
    try {
      const response = await fetch(`/api/attributes/${selectedAttributeId}/options/${editingOptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: optionFormData.name, status: optionFormData.status })
      })
      const result = await response.json()
      if (result.success) {
        showVariantToast('Opsi berhasil diperbarui', 'success')
        mutateVariants()
        resetOptionForm()
      } else {
        showVariantToast('Gagal memperbarui opsi: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error updating option:', err)
      showVariantToast('Terjadi kesalahan saat memperbarui opsi', 'error')
    } finally {
      setVariantSubmitting(false)
    }
  }

  const handleDeleteOption = async (id: string, name: string) => {
    if (!selectedAttributeId) return
    setConfirmModal({
      show: true,
      type: 'delete',
      title: 'Hapus Opsi',
      message: `Apakah Anda yakin ingin menghapus opsi "${name}"?`,
      onConfirm: async () => {
        setConfirmModal(null)
        await executeDeleteOption(id)
      }
    })
  }

  const executeDeleteOption = async (id: string) => {
    if (!selectedAttributeId) return
    try {
      const response = await fetch(`/api/attributes/${selectedAttributeId}/options/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json()
      if (result.success) {
        showVariantToast('Opsi berhasil dihapus', 'success')
        mutateVariants()
      } else {
        showVariantToast('Gagal menghapus opsi: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error deleting option:', err)
      showVariantToast('Terjadi kesalahan saat menghapus opsi', 'error')
    }
  }

  const handleEditOption = (opt: AttributeOption) => {
    setEditingOptionId(opt.id)
    setOptionFormData({ name: opt.name, status: opt.status })
  }

  const resetOptionForm = () => {
    setEditingOptionId(null)
    setOptionFormData({ name: '', status: 'active' })
  }

  // Combination functions
  const handleAddCombination = async () => {
    if (!showVariants || !combinationFormData.price || Object.keys(combinationFormData.options || {}).length === 0) return
    setVariantSubmitting(true)
    try {
      const response = await fetch(`/api/products/${showVariants}/combinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: combinationFormData.price,
          status: combinationFormData.status,
          options: combinationFormData.options
        })
      })
      const result = await response.json()
      if (result.success) {
        showVariantToast('Kombinasi berhasil ditambahkan', 'success')
        mutateVariants()
        resetCombinationForm()
      } else {
        showVariantToast('Gagal menambahkan kombinasi: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error adding combination:', err)
      showVariantToast('Terjadi kesalahan saat menambahkan kombinasi', 'error')
    } finally {
      setVariantSubmitting(false)
    }
  }

  const handleUpdateCombination = async () => {
    if (!showVariants || !editingCombinationId) return
    setVariantSubmitting(true)
    try {
      const response = await fetch(`/api/products/${showVariants}/combinations/${editingCombinationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: combinationFormData.price,
          status: combinationFormData.status,
          options: combinationFormData.options
        })
      })
      const result = await response.json()
      if (result.success) {
        showVariantToast('Kombinasi berhasil diperbarui', 'success')
        mutateVariants()
        resetCombinationForm()
      } else {
        showVariantToast('Gagal memperbarui kombinasi: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error updating combination:', err)
      showVariantToast('Terjadi kesalahan saat memperbarui kombinasi', 'error')
    } finally {
      setVariantSubmitting(false)
    }
  }

  const handleDeleteCombination = async (id: string, name: string) => {
    if (!showVariants) return
    setConfirmModal({
      show: true,
      type: 'delete',
      title: 'Hapus Kombinasi',
      message: `Apakah Anda yakin ingin menghapus kombinasi ini?`,
      onConfirm: async () => {
        setConfirmModal(null)
        await executeDeleteCombination(id)
      }
    })
  }

  const executeDeleteCombination = async (id: string) => {
    if (!showVariants) return
    try {
      const response = await fetch(`/api/products/${showVariants}/combinations/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json()
      if (result.success) {
        showVariantToast('Kombinasi berhasil dihapus', 'success')
        mutateVariants()
      } else {
        showVariantToast('Gagal menghapus kombinasi: ' + result.message, 'error')
      }
    } catch (err) {
      console.error('Error deleting combination:', err)
      showVariantToast('Terjadi kesalahan saat menghapus kombinasi', 'error')
    }
  }

  const handleEditCombination = (combo: VariantCombination) => {
    setEditingCombinationId(combo.id)
    setCombinationFormData({
      price: combo.price,
      status: combo.status,
      options: combo.options
    })
  }

  const resetCombinationForm = () => {
    setEditingCombinationId(null)
    setCombinationFormData({ price: 0, status: 'active', options: {} })
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
                <h3 className="text-xl md:text-2xl font-bold text-gray-950">Manajemen Variasi Produk</h3>
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

              {/* ===== ATRIBUT MANAGEMENT ===== */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-950 mb-4">Atribut Variasi</h4>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-950 mb-3">
                    {editingAttributeId ? 'Edit Atribut' : 'Tambah Atribut Baru'}
                  </h5>
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Atribut *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Type, Durasi, Tipe Akun"
                        value={attributeFormData.name || ''}
                        onChange={(e) => setAttributeFormData({ ...attributeFormData, name: e.target.value })}
                        className="input-field w-full"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        onClick={editingAttributeId ? handleUpdateAttribute : handleAddAttribute}
                        disabled={variantSubmitting || !attributeFormData.name}
                        className="btn-primary px-4 py-2"
                      >
                        {variantSubmitting ? 'Menyimpan...' : (editingAttributeId ? 'Update Atribut' : 'Tambah Atribut')}
                      </button>
                      {editingAttributeId && (
                        <button
                          onClick={resetAttributeForm}
                          disabled={variantSubmitting}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attributes List */}
                <div className="space-y-2">
                  {attributes.length === 0 ? (
                    <p className="text-gray-500 text-sm">Belum ada atribut. Tambahkan atribut di atas.</p>
                  ) : (
                    attributes.map((attr) => (
                      <div key={attr.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <span className="font-medium text-gray-950">{attr.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          attr.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {attr.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <div className="flex-1"></div>
                        <button
                          onClick={() => handleEditAttribute(attr)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAttribute(attr.id, attr.name)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium transition-colors"
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => setSelectedAttributeId(attr.id)}
                          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs font-medium transition-colors"
                        >
                          Kelola Opsi
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ===== OPSI MANAGEMENT ===== */}
              {selectedAttributeId && (
                <div className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-950">Opsi untuk Atribut: {attributes.find(a => a.id === selectedAttributeId)?.name}</h4>
                    <button
                      onClick={() => setSelectedAttributeId(null)}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      ✕ Tutup
                    </button>
                  </div>

                  <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-950 mb-3">
                      {editingOptionId ? 'Edit Opsi' : 'Tambah Opsi Baru'}
                    </h5>
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Opsi *</label>
                        <input
                          type="text"
                          placeholder="Contoh: Go, Plus, 1 Hari, 1 Bulan"
                          value={optionFormData.name || ''}
                          onChange={(e) => setOptionFormData({ ...optionFormData, name: e.target.value })}
                          className="input-field w-full"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <button
                          onClick={editingOptionId ? handleUpdateOption : handleAddOption}
                          disabled={variantSubmitting || !optionFormData.name}
                          className="btn-primary px-4 py-2"
                        >
                          {variantSubmitting ? 'Menyimpan...' : (editingOptionId ? 'Update Opsi' : 'Tambah Opsi')}
                        </button>
                        {editingOptionId && (
                          <button
                            onClick={resetOptionForm}
                            disabled={variantSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    {attributeOptions.length === 0 ? (
                      <p className="text-gray-500 text-sm">Belum ada opsi untuk atribut ini.</p>
                    ) : (
                      attributeOptions.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <span className="font-medium text-gray-950">{opt.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            opt.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {opt.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </span>
                          <div className="flex-1"></div>
                          <button
                            onClick={() => handleEditOption(opt)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOption(opt.id, opt.name)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ===== KOMBINASI MANAGEMENT ===== */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-950 mb-4">Kombinasi Variasi</h4>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-950 mb-3">
                    {editingCombinationId ? 'Edit Kombinasi' : 'Tambah Kombinasi Baru'}
                  </h5>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Harga (IDR) *</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Contoh: 5000"
                      value={combinationFormData.price || 0}
                      onChange={(e) => setCombinationFormData({ ...combinationFormData, price: parseInt(e.target.value) || 0 })}
                      className="input-field w-full max-w-xs"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      value={combinationFormData.status || 'active'}
                      onChange={(e) => setCombinationFormData({ ...combinationFormData, status: e.target.value as 'active' | 'inactive' })}
                      className="input-field w-full max-w-xs"
                    >
                      <option value="active">Tersedia</option>
                      <option value="inactive">Habis</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan Atribut</label>
                    <div className="space-y-2">
                      {attributes.map((attr) => {
                        const attrOptions = attributeOptions.filter(o => o.attributeId === attr.id && o.status === 'active')
                        if (attrOptions.length === 0) return null
                        const selectedOptionId = (combinationFormData.options || {})[attr.id] || ''
                        return (
                          <div key={attr.id} className="flex items-center gap-3">
                            <label className="font-medium text-gray-700 w-32">{attr.name}:</label>
                            <select
                              value={selectedOptionId}
                              onChange={(e) => setCombinationFormData({ 
                                ...combinationFormData, 
                                options: { ...(combinationFormData.options || {}), [attr.id]: e.target.value } 
                              })}
                              className="input-field w-full max-w-xs"
                            >
                              <option value="">-- Pilih {attr.name} --</option>
                              {attrOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={editingCombinationId ? handleUpdateCombination : handleAddCombination}
                      disabled={variantSubmitting || !combinationFormData.price || Object.keys(combinationFormData.options || {}).length !== attributes.length}
                      className="btn-primary px-4 py-2"
                    >
                      {variantSubmitting ? 'Menyimpan...' : (editingCombinationId ? 'Update Kombinasi' : 'Tambah Kombinasi')}
                    </button>
                    {editingCombinationId && (
                      <button
                        onClick={resetCombinationForm}
                        disabled={variantSubmitting}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </div>

                {/* Combinations List */}
                <div className="space-y-3">
                  {combinations.length === 0 ? (
                    <p className="text-gray-500 text-sm">Belum ada kombinasi variasi. Lengkapi atribut dan opsi terlebih dahulu, lalu tambahkan kombinasi di atas.</p>
                  ) : (
                    <>
                      <h4 className="text-lg font-semibold text-gray-950 mb-3">Daftar Kombinasi</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left font-semibold text-gray-700">Atribut</th>
                              <th className="px-4 py-2 text-left font-semibold text-gray-700">Harga</th>
                              <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                              <th className="px-4 py-2 text-left font-semibold text-gray-700">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {combinations.map((combo) => (
                              <tr key={combo.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="space-y-1">
                                    {attributes.map(attr => {
                                      const optId = combo.options[attr.id]
                                      const opt = attributeOptions.find(o => o.id === optId)
                                      return opt ? (
                                        <div key={attr.id} className="flex gap-2 text-xs">
                                          <span className="font-medium text-gray-500">{attr.name}:</span>
                                          <span className="font-medium text-gray-900">{opt.name}</span>
                                        </div>
                                      ) : null
                                    })}
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-semibold text-blue-600">{formatPrice(combo.price)}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    combo.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {combo.status === 'active' ? 'Tersedia' : 'Habis'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditCombination(combo)}
                                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCombination(combo.id, 'kombinasi')}
                                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium transition-colors"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}