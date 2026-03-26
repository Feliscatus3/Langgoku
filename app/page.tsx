'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import ProductGrid from '@/components/ProductGrid'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import TestimoniesSlider from '@/components/TestimoniesSlider'
import Link from 'next/link'

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="bg-white">
      {/* Hero Section with Modern Design */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden pb-12 md:pb-16 lg:pb-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>


        <div className="absolute inset-0 overflow-hidden pointer-events-none md:h-full">
          {/* Canva - Top Left */}
          <div className="absolute top-10 sm:top-12 left-4 sm:left-8 w-14 h-14 sm:w-20 sm:h-20 animate-float" style={{animationDelay: '0s'}}>
            <div className="relative w-full h-full rounded-full bg-white/5 backdrop-blur-md border border-white/20 p-1 sm:p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Image
                src="/images/canva.png"
                alt="Canva"
                fill
                className="object-contain p-1 rounded-full opacity-90"
                priority
              />
            </div>
          </div>

          {/* CapCut - Top Right */}
          <div className="absolute top-14 sm:top-20 right-4 sm:right-12 w-16 h-16 sm:w-24 sm:h-24 animate-bounce" style={{animationDelay: '0.5s'}}>
            <div className="relative w-full h-full rounded-full bg-white/5 backdrop-blur-md border border-white/20 p-1 sm:p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Image
                src="/images/capcut.png"
                alt="CapCut"
                fill
                className="object-contain p-1 rounded-full opacity-90"
                priority
              />
            </div>
          </div>

          {/* Alightmotion - Middle Left */}
          <div className="absolute top-1/3 left-3 sm:left-4 w-12 h-12 sm:w-16 sm:h-16 animate-pulse">
            <div className="relative w-full h-full rounded-full bg-white/5 backdrop-blur-md border border-white/20 p-1.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Image
                src="/images/alightmotion.png"
                alt="Alightmotion"
                fill
                className="object-contain p-1 rounded-full opacity-90"
                priority
              />
            </div>
          </div>

          {/* Zoom - Middle Right */}
          <div className="absolute top-2/5 right-4 sm:right-8 w-14 h-14 sm:w-20 sm:h-20 animate-float" style={{animationDelay: '1.5s'}}>
            <div className="relative w-full h-full rounded-full bg-white/5 backdrop-blur-md border border-white/20 p-1 sm:p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Image
                src="/images/zoom.png"
                alt="Zoom"
                fill
                className="object-contain p-1 rounded-full opacity-90"
                priority
              />
            </div>
          </div>

          {/* Spotify - Bottom Left */}
          <div className="absolute bottom-24 sm:bottom-32 left-2 sm:left-6 w-14 h-14 sm:w-20 sm:h-20 animate-bounce" style={{animationDelay: '1s'}}>
            <div className="relative w-full h-full rounded-full bg-white/5 backdrop-blur-md border border-white/20 p-1 sm:p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Image
                src="/images/spotify.png"
                alt="Spotify"
                fill
                className="object-contain p-1 rounded-full opacity-90"
                priority
              />
            </div>
          </div>

          {/* Netflix - Bottom Right */}
          <div className="absolute bottom-24 sm:bottom-28 right-2 sm:right-12 w-16 h-16 sm:w-24 sm:h-24 animate-float" style={{animationDelay: '2s'}}>
            <div className="relative w-full h-full rounded-full bg-white/5 backdrop-blur-md border border-white/20 p-1 sm:p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Image
                src="/images/netflix.png"
                alt="Netflix"
                fill
                className="object-contain p-1 rounded-full opacity-90"
                priority
              />
            </div>
          </div>

          {/* ChatGPT - Bottom Center Left */}
          <div className="absolute bottom-28 sm:bottom-40 left-1/4 w-12 h-12 sm:w-16 sm:h-16 animate-pulse" style={{animationDelay: '1.5s'}}>
            <div className="relative w-full h-full rounded-full bg-white/5 backdrop-blur-md border border-white/20 p-1 sm:p-1.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Image
                src="/images/chatgpt.png"
                alt="ChatGPT"
                fill
                className="object-contain p-1 rounded-full opacity-90"
                priority
              />
            </div>
          </div>

          {/* Gemini - Bottom Center Right */}
          <div className="absolute bottom-28 sm:bottom-44 right-1/4 w-14 h-14 sm:w-20 sm:h-20 animate-float" style={{animationDelay: '0.8s'}}>
            <div className="relative w-full h-full rounded-full bg-white/5 backdrop-blur-md border border-white/20 p-1 sm:p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Image
                src="/images/gemini.png"
                alt="Gemini"
                fill
                className="object-contain p-1 rounded-full opacity-90"
                priority
              />
            </div>
          </div>
        </div>

        <div className="container-custom relative z-10 py-12 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-8 inline-block animate-fade-in-up">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-lg opacity-50"></div>
                <span className="relative bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-full text-sm font-bold tracking-wide shadow-lg border border-white/20">
                  🛍️ Belanja Smart, Hemat Budget
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-200 mb-4 leading-none tracking-tight">
                LANGGOKU
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
            </div>

            {/* Subtitle */}
            <div className="mb-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <p className="text-xl md:text-2xl text-gray-200 mb-6 font-medium leading-relaxed max-w-2xl mx-auto">
                Platform terpercaya untuk membeli akun premium digital dengan harga terjangkau
              </p>
              <p className="text-lg md:text-xl text-cyan-200 font-light">
                Netflix, Canva, CapCut, dan lebih dari 50+ layanan premium tersedia
              </p>
            </div>

            {/* Services Showcase */}
            <div className="mb-8 md:mb-12 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="flex flex-wrap justify-center gap-2 md:gap-6">
                {[
                  { name: 'Netflix', color: 'from-red-500 to-red-600' },
                  { name: 'Canva', color: 'from-blue-500 to-blue-600' },
                  { name: 'CapCut', color: 'from-green-500 to-green-600' },
                  { name: 'Spotify', color: 'from-green-400 to-green-500' },
                  { name: 'Disney+', color: 'from-blue-600 to-purple-600' }
                ].map((service, index) => (
                  <div key={service.name} className="group">
                    <div className={`bg-gradient-to-r ${service.color} px-3 md:px-4 py-2 rounded-full text-white font-semibold text-xs md:text-sm shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl border border-white/20`}>
                      {service.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-12 md:h-16 lg:h-20">
            <path fill="#ffffff" d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {/* Stat 1 */}
            <div className="group text-center p-8 md:p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300 border border-blue-100 hover:border-blue-300">
              <div className="text-4xl md:text-5xl mb-4">📦</div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Produk Premium</h3>
              <p className="text-gray-600 text-sm md:text-base">Koleksi lengkap produk dan layanan berkualitas tinggi pilihan terbaik</p>
            </div>

            {/* Stat 2 */}
            <div className="group text-center p-8 md:p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300 border border-green-100 hover:border-green-300">
              <div className="text-4xl md:text-5xl mb-4">🛡️</div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Terpercaya & Aman</h3>
              <p className="text-gray-600 text-sm md:text-base">Transaksi aman dengan sistem enkripsi terkini dan jaminan kepuasan pelanggan</p>
            </div>

            {/* Stat 3 */}
            <div className="group text-center p-8 md:p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all duration-300 border border-purple-100 hover:border-purple-300">
              <div className="text-4xl md:text-5xl mb-4">💬</div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Dukungan Pelanggan</h3>
              <p className="text-gray-600 text-sm md:text-base">Tim support responsif siap membantu Anda 24/7 untuk kepuasan maksimal</p>
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
              description={error || "Terjadi kesalahan saat memuat produk"}
            />
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div>
              <ProductGrid products={products} />
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
