'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
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

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Produk tidak ditemukan')
      }

      setProduct(data.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const handleCheckout = () => {
    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert('Mohon lengkapi data pembeli')
      return
    }

    // Generate unique code
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const finalPrice = (product?.price || 0) + parseInt(uniqueCode.charCodeAt(0).toString())

    // Prepare checkout data
    const checkoutData = {
      productId: product?.id,
      productName: product?.name,
      productDuration: product?.duration,
      originalPrice: product?.price,
      uniqueCode,
      finalPrice,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
    }

    // Store in session and redirect to checkout
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData))
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold">Memuat produk...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="container-custom text-center py-16">
          <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100 max-w-md mx-auto">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-8">{error || 'Produk yang Anda cari tidak tersedia'}</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              ← Kembali ke Produk
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container-custom">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-8 font-medium transition-colors duration-300">
            ← Kembali ke Produk
          </Link>
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black mb-4">Detail Produk</h1>
            <p className="text-xl text-blue-100">Informasi lengkap produk premium yang Anda pilih</p>
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Product Image */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center relative">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-500"
                      priority
                    />
                  ) : (
                    <div className="text-9xl">📱</div>
                  )}
                </div>
              </div>

              {/* Product Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{product.duration}</div>
                  <p className="text-gray-600 font-medium">Durasi Aktif</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
                  <div className={`text-3xl font-bold mb-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock}
                  </div>
                  <p className="text-gray-600 font-medium">Stok Tersedia</p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{product.name}</h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {product.description || 'Produk premium digital eksklusif dengan kualitas terbaik dan harga terjangkau.'}
                </p>
              </div>

              {/* Price Section */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Harga Spesial</p>
                    <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-4">
                <span
                  className={`px-6 py-3 rounded-full font-bold text-sm shadow-lg ${
                    product.stock > 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                  }`}
                >
                  {product.stock > 0 ? '✅ Tersedia' : '❌ Stok Habis'}
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                  ⚡ Instant Delivery
                </span>
              </div>

              {/* Purchase Section */}
              {!showCheckout ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowCheckout(true)}
                    disabled={product.stock <= 0}
                    className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl ${
                      product.stock > 0
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.stock > 0 ? '🛒 Beli Sekarang' : 'Stok Habis'}
                  </button>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                      { icon: '🚚', text: 'Kirim Instant' },
                      { icon: '🛡️', text: 'Garansi Aktif' },
                      { icon: '💬', text: 'Support 24/7' }
                    ].map((feature, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                        <div className="text-2xl mb-2">{feature.icon}</div>
                        <p className="text-sm font-medium text-gray-700">{feature.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">👤</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Data Pembeli</h3>
                      <p className="text-gray-600">Lengkapi informasi untuk melanjutkan pembelian</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Nomor WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="+62 xxx-xxxx-xxxx"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 text-gray-900 font-medium"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleCheckout}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        💳 Lanjut Pembayaran
                      </button>
                      <button
                        onClick={() => setShowCheckout(false)}
                        className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300"
                      >
                        ✕ Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
