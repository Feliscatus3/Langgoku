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

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Produk</h2>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Tidak ada produk. Hubungkan Google Sheets terlebih dahulu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="card p-4 flex justify-between items-center"
            >
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                <p className="text-gray-600">
                  {formatPrice(product.price)} • {product.duration} • Stok: {product.stock}
                </p>
              </div>
              <button
                onClick={() => handleEdit(product)}
                className="btn-primary text-sm"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Produk</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nama"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Harga"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Durasi"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="input-field"
              />
              <input
                type="number"
                placeholder="Stok"
                value={formData.stock || 0}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="input-field"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary flex-1">
                  Simpan
                </button>
                <button onClick={handleCancel} className="btn-secondary flex-1">
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
