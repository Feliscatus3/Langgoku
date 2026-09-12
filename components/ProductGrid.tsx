import ProductCard from './ProductCard'

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
