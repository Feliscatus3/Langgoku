export interface ProductVariant {
  id: string
  productId: string
  name: string
  durationDays: number
  price: number
  status: 'active' | 'inactive'
  sortOrder: number
}

export interface Product {
  id: string
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  description?: string
  variants?: ProductVariant[]
}
