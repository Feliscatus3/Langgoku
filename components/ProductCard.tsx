'use client'

import Link from 'next/link'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    duration: string
    stock: number
    image?: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const isAvailable = product.stock > 0
  const formattedPrice = formatPrice(product.price)

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Link href={`/product/${product.id}`}>
      <div className="card p-5 md:p-6 h-full cursor-pointer overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
        {/* Product Image - Enhanced */}
        <div className="w-full h-40 md:h-48 bg-gradient-to-br from-blue-50 via-white to-amber-50 rounded-2xl mb-4 md:mb-6 flex items-center justify-center overflow-hidden relative border border-gray-200 group-hover:border-blue-300">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="text-5xl md:text-6xl group-hover:scale-125 transition-transform duration-500 drop-shadow-lg">
              {product.name.includes('Netflix') && '🎬'}
              {product.name.includes('Canva') && '🎨'}
              {product.name.includes('CapCut') && '✂️'}
              {!product.name.includes('Netflix') && !product.name.includes('Canva') && !product.name.includes('CapCut') && '📱'}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent group-hover:from-blue-900/20 transition-all duration-300"></div>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Duration Badge */}
        <p className="text-xs md:text-sm text-gray-600 mb-4 flex items-center gap-2">
          <span className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-semibold border border-blue-200">
            <span>⏱️</span> {product.duration}
          </span>
        </p>

        {/* Price - Highlighted */}
        <div className="mb-4 p-3 md:p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 hover:border-amber-300 transition-colors">
          <p className="text-xs text-gray-600 font-medium mb-1">💰 Harga</p>
          <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
            {formattedPrice}
          </p>
        </div>

        {/* Status & Stock */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <span
            className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border flex items-center gap-1 ${
              isAvailable
                ? 'bg-green-100 text-green-800 border-green-300 shadow-sm'
                : 'bg-red-100 text-red-800 border-red-300 shadow-sm'
            }`}
          >
            {isAvailable ? '✅ Tersedia' : '❌ Habis'}
          </span>
          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1.5 rounded-full border border-gray-300 flex items-center gap-1">
            📦 {product.stock}
          </span>
        </div>

        {/* Button - Modern */}
        <button
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform group-hover:shadow-lg flex items-center justify-center gap-2 text-sm md:text-base ${
            isAvailable
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isAvailable}
        >
          {isAvailable ? ( <>
            <span>🛒</span> Beli Sekarang
          </> ) : (
            'Stok Habis'
          )}
        </button>
      </div>
    </Link>
  )
}
