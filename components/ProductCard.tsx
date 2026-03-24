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
      <div className="card p-4 h-full cursor-pointer hover:scale-105 transition-transform duration-300">
        {/* Product Image */}
        <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl">📱</div>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
          {product.name}
        </h3>

        {/* Duration */}
        <p className="text-sm text-gray-600 mb-3">
          Durasi: <span className="font-semibold">{product.duration}</span>
        </p>

        {/* Price */}
        <p className="text-2xl font-bold text-blue-600 mb-4">
          {formattedPrice}
        </p>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isAvailable
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isAvailable ? 'Tersedia' : 'Habis'}
          </span>
          <span className="text-xs text-gray-500">
            Stok: {product.stock}
          </span>
        </div>

        {/* Button */}
        <button
          className={`w-full mt-4 py-2 rounded-lg font-semibold transition ${
            isAvailable
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isAvailable}
        >
          {isAvailable ? 'Lihat Detail' : 'Stok Habis'}
        </button>
      </div>
    </Link>
  )
}
