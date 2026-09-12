'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ProductVariant {
  id: string
  productId: string
  name: string
  durationValue: number
  durationUnit: 'Jam' | 'Hari' | 'Bulan' | 'Lifetime'
  price: number
  status: 'active' | 'inactive'
  sortOrder: number
}

interface Product {
  id: string
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  description?: string
  variants?: any[]
}

interface ProductPurchaseClientProps {
  product: {
    id: string
    name: string
    price: number
    duration: string
    stock: number
    image?: string
    description?: string
    variants?: any[]
  }
  selectedVariant: any
  formatPrice: (price: number) => string
}

export default function ProductPurchaseClient({ product, selectedVariant: selectedVariantProp, formatPrice }: {
  product: {
    id: string
    name: string
    price: number
    duration: string
    stock: number
    image?: string
    description?: string
    variants?: any[]
  }
  selectedVariant: any
  formatPrice: (price: number) => string
}) {
  const router = useRouter()
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  // Sync selectedVariant from props
  useEffect(() => {
    setSelectedVariant(selectedVariant)
  }, [selectedVariant])

  const handleCheckout = () => {
    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert('Mohon lengkapi data pembeli')
      return
    }

    const finalPrice = selectedVariant ? selectedVariant.price : (product?.price || 0)
    const productDuration = selectedVariant ? `${selectedVariant.durationValue} ${selectedVariant.durationUnit}` : product?.duration

    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const uniqueCodeNum = parseInt(uniqueCode.charCodeAt(0).toString())
    const priceWithCode = finalPrice + uniqueCodeNum

    const checkoutData = {
      productId: product?.id,
      productName: product?.name,
      productDuration: selectedVariant ? `${selectedVariant.durationValue} ${selectedVariant.durationUnit}` : product?.duration,
      originalPrice: finalPrice,
      uniqueCode,
      finalPrice: priceWithCode,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
    }

    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData))
    router.push('/checkout')
  }

  if (!showCheckout) {
    const finalPrice = selectedVariant ? selectedVariant.price : (product?.price || 0)
    const productDuration = selectedVariant ? `${selectedVariant.durationValue} ${selectedVariant.durationUnit}` : product?.duration

    return (
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
    )
  }

  if (showCheckout) {
    const finalPrice = selectedVariant ? selectedVariant.price : (product?.price || 0)
    const priceWithCode = finalPrice + parseInt(Math.random().toString(36).substring(2, 8).toUpperCase().charCodeAt(0).toString())

    return (
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
    )
  }

  return null
}