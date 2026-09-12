'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/googleSheets'
import ProductPurchaseClient from './ProductPurchaseClient'

interface VariantAttribute {
  id: string
  productId: string
  name: string
  sortOrder: number
  status: 'active' | 'inactive'
}

interface AttributeOption {
  id: string
  attributeId: string
  name: string
  sortOrder: number
  status: 'active' | 'inactive'
}

interface VariantCombination {
  id: string
  productId: string
  price: number
  status: 'active' | 'inactive'
  stock: number
  sortOrder: number
  options: Record<string, string> // attributeId -> optionId
}

interface Product {
  id: string
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  description?: string
  variantAttributes?: Array<{
    id: string
    productId: string
    name: string
    sortOrder: number
    status: 'active' | 'inactive'
  }>
  attributeOptions?: Array<{
    id: string
    attributeId: string
    name: string
    sortOrder: number
    status: 'active' | 'inactive'
  }>
  variantCombinations?: Array<{
    id: string
    productId: string
    price: number
    status: 'active' | 'inactive'
    stock: number
    sortOrder: number
    options: Record<string, string> // attributeId -> optionId
  }>
}

interface ProductDetailClientProps {
  initialProduct: {
    id: string
    name: string
    price: number
    duration: string
    stock: number
    image?: string
    description?: string
    variantAttributes?: Array<{
      id: string
      productId: string
      name: string
      sortOrder: number
      status: 'active' | 'inactive'
    }>
    attributeOptions?: Array<{
      id: string
      attributeId: string
      name: string
      sortOrder: number
      status: 'active' | 'inactive'
    }>
    variantCombinations?: Array<{
      id: string
      productId: string
      price: number
      status: 'active' | 'inactive'
      stock: number
      sortOrder: number
      options: Record<string, string> // attributeId -> optionId
    }>
  }
  formatPrice: (price: number) => string
}

export default function ProductDetailClient({ initialProduct, formatPrice }: {
  initialProduct: {
    id: string
    name: string
    price: number
    duration: string
    stock: number
    image?: string
    description?: string
    variantAttributes?: Array<{
      id: string
      productId: string
      name: string
      sortOrder: number
      status: 'active' | 'inactive'
    }>
    attributeOptions?: Array<{
      id: string
      attributeId: string
      name: string
      sortOrder: number
      status: 'active' | 'inactive'
    }>
    variantCombinations?: Array<{
      id: string
      productId: string
      price: number
      status: 'active' | 'inactive'
      stock: number
      sortOrder: number
      options: Record<string, string>
    }>
  }
  formatPrice: (price: number) => string
) {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(initialProduct)
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedCombination, setSelectedCombination] = useState<any | null>(null)

  // Auto-select first active combination if available
  useEffect(() => {
    if (product.variantCombinations && product.variantCombinations.length > 0) {
      const activeCombos = product.variantCombinations.filter(c => c.status === 'active')
      if (activeCombos.length > 0) {
        setSelectedCombination(activeCombos[0])
      }
    }
  }, [product])

  const handleCheckout = () => {
    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert('Mohon lengkapi data pembeli')
      return
    }

    const finalPrice = selectedCombination ? selectedCombination.price : (product?.price || 0)
    const productDuration = product?.duration || ''

    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const uniqueCodeNum = parseInt(uniqueCode.charCodeAt(0).toString())
    const priceWithCode = finalPrice + uniqueCodeNum

    // Build variant name from selected combination
    let variantName = ''
    if (selectedCombination && product.variantAttributes && product.attributeOptions) {
      const optionNames = Object.entries(selectedCombination.options || {}).map(([attrId, optId]) => {
        const attr = product.variantAttributes?.find(a => a.id === attrId)
        const opt = product.attributeOptions?.find(o => o.id === optId)
        if (attr && opt) {
          return `${attr.name}: ${opt.name}`
        }
        return ''
      }).filter(Boolean)
      variantName = optionNames.join(', ')
    }

    const finalPrice = selectedCombination ? selectedCombination.price : (product?.price || 0)
    const productDuration = product?.duration || ''

    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const uniqueCodeNum = parseInt(uniqueCode.charCodeAt(0).toString())
    const priceWithCode = finalPrice + uniqueCodeNum

    const checkoutData = {
      productId: product?.id,
      productName: product?.name,
      productDuration: product?.duration,
      originalPrice: finalPrice,
      uniqueCode,
      finalPrice: priceWithCode,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      variantId: selectedCombination?.id,
      variantName: variantName,
    }

    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData))
    router.push('/checkout')
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="container-custom text-center py-16">
          <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100 max-w-md mx-auto">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-8">Produk yang Anda cari tidak tersedia</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              ← Kembali ke Produk
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const selectedCombinationPrice = selectedCombination ? selectedCombination.price : product.price
  const selectedCombinationName = selectedCombination 
    ? (() => {
        if (!product.variantAttributes || !product.attributeOptions || !selectedCombination.options) return ''
        return Object.entries(selectedCombination.options || {})
          .map(([attrId, optId]) => {
            const attr = product.variantAttributes?.find(a => a.id === attrId)
            const opt = product.attributeOptions?.find(o => o.id === optId)
            if (attr && opt) return `${attr.name}: ${opt.name}`
            return ''
          })
          .filter(Boolean)
          .join(', ')
      })() : product.duration

  const selectedCombinationPrice = selectedCombination ? selectedCombination.price : product.price
  const productDuration = selectedCombination ? product.variantAttributes?.map(a => {
    const optId = selectedCombination.options?.[a.id]
    const opt = product.attributeOptions?.find(o => o.id === selectedCombination.options?.[a.id])
    return opt ? `${a.name}: ${opt.name}` : ''
  }).filter(Boolean).join(', ') : product.duration

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
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {product.duration}
                  </div>
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
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{product.name}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.description || 'Produk premium digital eksklusif dengan kualitas terbaik dan harga terjangkau.'}
              </p>
            </div>

            {/* Variant Selector */}
            {product.variantCombinations && product.variantCombinations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Pilih Varian
                </label>
                <select
                  value={selectedCombination?.id || ''}
                  onChange={(e) => {
                    const comboId = e.target.value
                    const combo = product.variantCombinations?.find(c => c.id === comboId)
                    setSelectedCombination(combo || null)
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium bg-white"
                >
                  <option value="">Pilih varian</option>
                  {product.variantCombinations.map((combo: any) => (
                    <option key={combo.id} value={combo.id} disabled={combo.status !== 'active'}>
                      {(() => {
                        const names = Object.entries(combo.options || {}).map(([attrId, optId]) => {
                          const attr = product.variantAttributes?.find(a => a.id === attrId)
                          // We need to find the option name - this is a simplified version
                          return opt?.name || 'Unknown'
                        }).filter(Boolean)
                        return optionNames.join(', ')
                      })()}
                      — {formatPrice(combo.price)}
                      {combo.status !== 'active' ? ' (Habis)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">Harga akan berubah otomatis sesuai pilihan Anda</p>
              </div>
            )}

            {/* Price Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">💰</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Harga Spesial</p>
                  <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                    {formatPrice(selectedCombination ? selectedCombination.price : product.price)}
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
            <ProductPurchaseClient 
              product={product}
              selectedCombination={selectedCombination}
              formatPrice={formatPrice}
            />
          </div>
        </div>
      </div>
    </div>
  )
}