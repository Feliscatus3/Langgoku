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
      <div className="card p-6 h-full cursor-pointer overflow-hidden group">
        {/* Product Image - Enhanced */}
        <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-amber-50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="text-6xl group-hover:scale-125 transition-transform duration-500">📱</div>
          )}
          <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-all duration-300"></div>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Duration */}
        <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full font-semibold text-gray-700">
            {product.duration}
          </span>
        </p>

        {/* Price - Highlighted */}
        <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-gray-50 rounded-xl border border-amber-200">
          <p className="text-xs text-gray-600 font-medium mb-1">Harga</p>
          <p className="text-2xl font-bold text-gradient">
            {formattedPrice}
          </p>
        </div>

        {/* Status & Stock */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              isAvailable
                ? 'badge-success shadow-lg'
                : 'badge-danger shadow-lg'
            }`}
          >
            {isAvailable ? '✓ Tersedia' : '✗ Habis'}
          </span>
          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            Stok: {product.stock}
          </span>
        </div>

        {/* Button - Modern */}
        <button
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform group-hover:shadow-lg ${
            isAvailable
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isAvailable}
        >
          {isAvailable ? '→ Lihat Detail' : 'Stok Habis'}
        </button>
      </div>
    </Link>
  )
}
