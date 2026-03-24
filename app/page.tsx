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
    <div className="bg-white">
      <div className="container-custom py-12 md:py-20">
        {/* Hero Section */}
        <div className="mb-16 md:mb-20">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-950 mb-4 leading-tight">
              Langgoku
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6">
              Belanja akun premium digital terpercaya dengan harga terjangkau
            </p>
            <p className="text-gray-500 text-base">
              Netflix, Canva, CapCut, dan layanan premium lainnya tersedia dengan berbagai durasi langganan
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center px-4">
            <div className="max-w-2xl w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field w-full pl-11"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
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
