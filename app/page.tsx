'use client'

import { useEffect, useState } from 'react'
import ProductGrid from '@/components/ProductGrid'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import TestimoniesSlider from '@/components/TestimoniesSlider'
import Link from 'next/link'

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
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-amber-50 section-wrapper">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="mb-6 inline-block">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                Belanja Smart, Hemat Budget
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-950 mb-6 leading-tight">
              Langgoku
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-4">
              Platform terpercaya untuk membeli akun premium digital dengan harga terjangkau
            </p>
            <p className="text-gray-600 text-base md:text-lg">
              Netflix, Canva, CapCut, dan lebih dari 50+ layanan premium tersedia
            </p>
          </div>

          {/* Search Bar with Icon */}
          <div className="flex justify-center px-4 mb-12">
            <div className="max-w-2xl w-full">
              <div className="relative shadow-lg rounded-full overflow-hidden bg-white border-2 border-blue-100">
                <input
                  type="text"
                  placeholder="Cari produk premium impianmu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field w-full pl-12 pr-4 py-3 border-0 focus:ring-0"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">{products.length}+</div>
              <p className="text-gray-700 font-medium">Produk Premium</p>
            </div>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <p className="text-gray-700 font-medium">Terpercaya & Aman</p>
            </div>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-gray-700 font-medium">Dukungan Pelanggan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container-custom section-wrapper">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-950 mb-3">Produk Unggulan</h2>
              <p className="text-gray-600 text-lg">Layanan premium terbaik dengan harga kompetitif</p>
            </div>
            {!loading && !error && products.length > 0 && (
              <Link href="/shop" className="text-blue-600 hover:text-blue-700 font-bold text-lg hidden md:block">
                Lihat Semua →
              </Link>
            )}
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
              <ProductGrid products={filteredProducts} />
              {searchTerm && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">Produk tidak ditemukan</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-700 font-medium mt-2"
                  >
                    Hapus filter pencarian
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA Section */}
        {!loading && !error && products.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Link href="/shop" className="btn-primary text-lg px-12 py-4 md:hidden">
              Lihat Semua Produk
            </Link>
          </div>
        )}
      </div>

      {/* Testimonies Section */}
      <TestimoniesSlider />
    </div>
  )
}
