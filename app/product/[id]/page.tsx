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

  if (loading) return <LoadingSpinner />

  if (error || !product) {
    return (
      <div className="container-custom py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 text-lg mb-6 font-medium">{error || 'Produk tidak ditemukan'}</p>
          <Link href="/" className="btn-primary inline-block">
            ← Kembali ke Produk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-10 font-semibold transition-colors">
          ← Kembali ke Produk
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-amber-50 rounded-3xl flex items-center justify-center overflow-hidden shadow-lg border border-gray-200">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  priority
                />
              ) : (
                <div className="text-9xl">📱</div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl font-bold text-gradient mb-4">{product.name}</h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">{product.description || 'Produk premium digital eksklusif'}</p>

            {/* Price - Highlighted Box */}
            <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-gray-50 rounded-2xl border-2 border-amber-200">
              <p className="text-sm text-gray-600 font-medium mb-2">Harga Spesial</p>
              <p className="text-5xl font-bold text-gradient">{formatPrice(product.price)}</p>
            </div>

            {/* Duration & Stock */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="card p-6 border-l-4 border-blue-600">
                <p className="text-gray-600 text-sm font-semibold mb-2">Durasi</p>
                <p className="text-3xl font-bold text-gray-900">{product.duration}</p>
              </div>
              <div className="card p-6 border-l-4 border-amber-500">
                <p className="text-amber-600 text-sm font-semibold mb-2">Stok Tersedia</p>
                <p className="text-3xl font-bold text-amber-700">{product.stock}</p>
              </div>
            </div>

            {/* Status */}
            <div className="mb-10">
              <span
                className={`px-6 py-2.5 rounded-full font-bold text-sm inline-block shadow-lg ${
                  product.stock > 0
                    ? 'badge-success'
                    : 'badge-danger'
                }`}
              >
                {product.stock > 0 ? '✓ Tersedia' : '✗ Stok Habis'}
              </span>
            </div>

            {/* Checkout Form */}
            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                disabled={product.stock <= 0}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  product.stock > 0
                    ? 'btn-primary hover:shadow-glow-primary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.stock > 0 ? '→ Beli Sekarang' : 'Stok Habis'}
              </button>
            ) : (
              <div className="card p-8 border border-accent-200 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-gradient mb-6">👤 Data Pembeli</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="+62 xxx-xxxx-xxxx"
                      className="input-field w-full"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCheckout}
                      className="btn-primary flex-1 py-3 font-semibold"
                    >
                      → Lanjut Pembayaran
                    </button>
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="btn-secondary flex-1 py-3 font-semibold"
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
  )
}
