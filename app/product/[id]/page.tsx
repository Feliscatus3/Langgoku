'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
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
  }

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
      <div className="container-custom py-12">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Produk tidak ditemukan'}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
            Kembali ke Produk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <Link href="/" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
        ← Kembali
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="flex items-center justify-center">
          <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-9xl">📱</div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 text-lg mb-6">{product.description || 'Produk premium digital'}</p>

          {/* Price */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-2">Harga</p>
            <p className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</p>
          </div>

          {/* Duration & Stock */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Durasi</p>
              <p className="text-xl font-semibold text-gray-900">{product.duration}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Stok Tersedia</p>
              <p className="text-xl font-semibold text-gray-900">{product.stock}</p>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <span
              className={`px-4 py-2 rounded-full font-semibold ${
                product.stock > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {product.stock > 0 ? 'Tersedia' : 'Stok Habis'}
            </span>
          </div>

          {/* Checkout Form */}
          {!showCheckout ? (
            <button
              onClick={() => setShowCheckout(true)}
              disabled={product.stock <= 0}
              className={`w-full py-3 rounded-lg font-bold text-lg transition ${
                product.stock > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? 'Beli Sekarang' : 'Stok Habis'}
            </button>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Data Pembeli</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+62 xxx-xxxx-xxxx"
                    className="input-field"
                  />
                </div>
                <div>
                  <button
                    onClick={handleCheckout}
                    className="btn-primary w-full"
                  >
                    Lanjut ke Pembayaran
                  </button>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="btn-secondary w-full mt-2"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
