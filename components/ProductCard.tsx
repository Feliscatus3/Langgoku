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
      <div className="card p-5 md:p-6 h-full cursor-pointer group hover:shadow-lg transition-all duration-300">
        {/* Product Image */}
        <div className="w-full h-48 md:h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-5 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-sm">Gambar tidak tersedia</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Duration & Price */}
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{product.duration}</span>
            <span className="text-lg md:text-xl font-bold text-blue-600">
              {formattedPrice}
            </span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className={`text-xs font-semibold uppercase tracking-wide ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {isAvailable ? 'Tersedia' : 'Habis'}
            </span>
            <span className="text-xs text-gray-400">Stok: {product.stock}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
