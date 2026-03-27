'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/lib/googleSheets'

interface Product {
  id: string
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  description?: string
}

export default function AdminProductManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    duration: '',
    stock: 0,
    image: '',
    description: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.success && data.data) {
        setProducts(data.data)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      alert('Gagal memuat produk')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.duration || formData.stock == null) {
      alert('Harap isi semua field yang diperlukan (*)') 
      return
    }

    setSubmitting(true)
    try {
      if (editingId) {
        // Update existing product - use the correct URL
        const response = await fetch(`/api/products/${editingId}/update-delete`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        
        if (data.success) {
          alert('Produk berhasil diperbarui')
          // Fetch fresh data from server after update
          await fetchProducts()
        } else {
          alert('Gagal memperbarui produk: ' + data.message)
        }
      } else {
        // Add new product
        const response = await fetch('/api/products/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        
        if (data.success) {
          alert('Produk berhasil ditambahkan')
          // Fetch fresh data from server after add
          await fetchProducts()
        } else {
          alert('Gagal menambahkan produk: ' + data.message)
        }
      }
      resetForm()
    } catch (err) {
      console.error('Error saving product:', err)
      alert('Terjadi kesalahan saat menyimpan produk')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData(product)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return

    try {
      // Use the correct URL path for delete
      const response = await fetch(`/api/products/${id}/update-delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Produk berhasil dihapus')
        // Fetch fresh data from server after delete
        await fetchProducts()
      } else {
        alert('Gagal menghapus produk: ' + data.message)
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      alert('Terjadi kesalahan saat menghapus produk')
    }
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

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-blue-600 font-medium">Memuat produk...</div>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-950 mb-1">Manajemen Produk</h2>
          <p className="text-gray-600 text-sm">Kelola catalog produk premium Anda</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary whitespace-nowrap"
          >
            + Tambah Produk
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-8 mb-8 shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-950 mb-6">
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
                onClick={handleAddProduct}
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? (editingId ? 'Menyimpan...' : 'Menambahkan...') : (editingId ? 'Update Produk' : 'Tambah Produk')}
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
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">Belum ada produk</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Tambah Produk Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="card p-6 shadow-sm hover:shadow-md transition-shadow">
              {product.image && (
                <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <h3 className="font-bold text-lg text-gray-950 mb-2">{product.name}</h3>
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p>Harga: <span className="font-semibold text-gray-950">{formatPrice(product.price)}</span></p>
                <p>Durasi: {product.duration}</p>
                <p>Stok: {product.stock}</p>
              </div>
              {product.description && (
                <p className="text-xs text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}