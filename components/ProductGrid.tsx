import ProductCard from './ProductCard'

interface ProductVariant {
  id: string
  productId: string
  name: string
  durationValue: number
  durationUnit: string
  price: number
  status: string
  sortOrder: number
}

interface Product {
  id: string
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  variants?: ProductVariant[]
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
