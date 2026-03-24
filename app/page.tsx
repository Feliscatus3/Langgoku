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
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white">
      <div className="container-custom py-6 md:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="mb-12 md:mb-16 text-center max-w-4xl mx-auto px-2 sm:px-4">
          <div className="mb-4 md:mb-6 inline-block">
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-lg animate-bounce">🚀</span>
          </div>
          <h1 className="text-4xl xs:text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 bg-clip-text text-transparent mb-3 md:mb-6 leading-tight break-words">
            Langgoku
          </h1>
          <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">
            🎯 Premium Digital Store
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto px-1 sm:px-0">
            Belanja akun premium terpercaya dan aman dengan berbagai pilihan: <span className="font-bold text-blue-600 inline-block">🎬 Netflix</span>, <span className="font-bold text-purple-600 inline-block">🎨 Canva</span>, <span className="font-bold text-pink-600 inline-block">✂️ CapCut</span>, dan lainnya
          </p>
          <div className="mt-6 md:mt-8 h-1 w-20 sm:w-24 md:w-32 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 rounded-full mx-auto"></div>
        </div>

        {/* Search Bar */}
        <div className="mb-12 md:mb-16 flex justify-center px-4">
          <div className="max-w-2xl w-full">
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
              <input
                type="text"
                placeholder="Cari produk premium Anda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full text-base md:text-lg py-3 md:py-4 pl-12"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Error/Empty State */}
        {!loading && error && (
          <EmptyState 
            title="📭 Produk Belum Tersedia"
            description={error}
          />
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div>
            <div className="mb-8 md:mb-12 flex justify-between items-center px-4">
              <div>
                <p className="text-gray-700 font-medium text-base md:text-lg">
                  Menampilkan <span className="font-bold text-blue-600 text-lg">{filteredProducts.length}</span> dari <span className="font-bold text-blue-600 text-lg">{products.length}</span> produk
                </p>
              </div>
            </div>
            <ProductGrid products={filteredProducts} />
          </div>
        )}

        {/* No Results */}
        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
          <EmptyState 
            title="🔎 Produk Tidak Ditemukan"
            description={`Tidak ada produk yang sesuai dengan pencarian "${searchTerm}". Coba cari dengan kata kunci lain.`}
          />
        )}
      </div>
    </div>
  )
}
