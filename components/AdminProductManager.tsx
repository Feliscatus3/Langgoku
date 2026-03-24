'use client'

import { useState, useEffect } from 'react'
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
  const [formData, setFormData] = useState<Partial<Product>>({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.success && data.data) {
        setProducts(data.data)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData(product)
  }

  const handleSave = async () => {
    console.log('Saving product:', formData)
    // This would connect to a backend API to update Google Sheets
    setEditingId(null)
    setFormData({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({})
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-primary-600 font-medium">Memuat produk...</div>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gradient mb-1">📦 Manajemen Produk</h2>
          <p className="text-primary-600 text-sm">Kelola semua produk digital premium Anda</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-primary-600 text-lg font-medium">Tidak ada produk. Hubungkan Google Sheets terlebih dahulu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="card p-6 flex justify-between items-center hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex-1">
                <h3 className="font-bold text-lg text-primary-900 group-hover:text-primary-700">{product.name}</h3>
                <p className="text-primary-600 text-sm mt-2 flex items-center gap-4">
                  <span className="badge-success text-xs">{formatPrice(product.price)}</span>
                  <span className="text-primary-500">{product.duration}</span>
                  <span className="text-primary-500">Stok: {product.stock}</span>
                </p>
              </div>
              <button
                onClick={() => handleEdit(product)}
                className="btn-primary ml-4"
              >
                ✎ Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-md w-full shadow-2xl border border-primary-200">
            <h3 className="text-2xl font-bold text-gradient mb-6">✎ Edit Produk</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nama"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full"
              />
              <input
                type="number"
                placeholder="Harga"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="input-field w-full"
              />
              <input
                type="text"
                placeholder="Durasi"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="input-field w-full"
              />
              <input
                type="number"
                placeholder="Stok"
                value={formData.stock || 0}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="input-field w-full"
              />
              <div className="flex gap-3 pt-4">
                <button onClick={handleSave} className="btn-primary flex-1">
                  ✓ Simpan
                </button>
                <button onClick={handleCancel} className="btn-secondary flex-1">
                  ✕ Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
