'use client'

import { useEffect, useState } from 'react'
import ProductGrid from '@/components/ProductGrid'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/products')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products')
      }

      if (!data.data || data.data.length === 0) {
        setError('Produk belum tersedia')
        setProducts([])
      } else {
        setProducts(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container-custom py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Langgoku - Premium Digital Store
        </h1>
        <p className="text-xl text-gray-600">
          Dapatkan akun premium Netflix, Canva, CapCut, dan layanan lainnya dengan harga terjangkau
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field max-w-md w-full"
        />
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Error/Empty State */}
      {!loading && error && (
        <EmptyState 
          title="Produk Belum Tersedia"
          description={error}
        />
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div>
          <p className="text-gray-600 mb-6">
            Menampilkan {filteredProducts.length} dari {products.length} produk
          </p>
          <ProductGrid products={filteredProducts} />
        </div>
      )}

      {/* No Results */}
      {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
        <EmptyState 
          title="Produk Tidak Ditemukan"
          description={`Tidak ada produk yang sesuai dengan pencarian "${searchTerm}"`}
        />
      )}
    </div>
  )
}
