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
    <div className="min-h-screen bg-white">
      <div className="container-custom py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center max-w-4xl mx-auto">
          <div className="mb-6 inline-block">
            <span className="text-6xl">🚀</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6">
            Langgoku
          </h1>
          <p className="text-2xl font-bold text-gray-900 mb-4">
            Premium Digital Store
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Dapatkan akun premium <span className="font-semibold text-blue-600">Netflix, Canva, CapCut</span>, dan layanan lainnya dengan harga terjangkau
          </p>
          <div className="mt-6 h-1 w-20 bg-gradient-to-r from-blue-600 to-amber-500 rounded-full mx-auto"></div>
        </div>

        {/* Search Bar */}
        <div className="mb-12 flex justify-center">
          <div className="max-w-2xl w-full">
            <input
              type="text"
              placeholder="🔍 Cari produk premium Anda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full text-lg py-4"
            />
          </div>
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
            <div className="mb-8 flex justify-between items-center">
              <div>
                <p className="text-gray-600 font-medium text-lg">
                  Menampilkan <span className="font-bold text-blue-600">{filteredProducts.length}</span> dari <span className="font-bold text-blue-600">{products.length}</span> produk
                </p>
              </div>
            </div>
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
    </div>
  )
}
