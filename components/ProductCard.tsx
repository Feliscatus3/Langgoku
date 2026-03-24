'use client'

import Link from 'next/link'
import Image from 'next/image'

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
      <div className="card p-5 md:p-6 h-full cursor-pointer group">
        {/* Product Image */}
        <div className="w-full h-48 md:h-56 bg-gray-100 rounded-md mb-5 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-6xl text-gray-300">
              {product.name.includes('Netflix') && '🎬'}
              {product.name.includes('Canva') && '🎨'}
              {product.name.includes('CapCut') && '✂️'}
              {!product.name.includes('Netflix') && !product.name.includes('Canva') && !product.name.includes('CapCut') && '📱'}
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="font-medium text-base md:text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Duration & Price */}
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-xs text-gray-500 font-medium">{product.duration}</span>
            <span className="text-lg md:text-xl font-semibold text-gray-950">
              {formattedPrice}
            </span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${isAvailable ? 'text-emerald-600' : 'text-red-600'}`}>
              {isAvailable ? '✓ Tersedia' : '✕ Habis'}
            </span>
            <span className="text-xs text-gray-500">Stok: {product.stock}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
