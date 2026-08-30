export interface VariantAttribute {
  id: string
  productId: string
  name: string
  sortOrder: number
  status: 'active' | 'inactive'
}

export interface AttributeOption {
  id: string
  attributeId: string
  name: string
  sortOrder: number
  status: 'active' | 'inactive'
}

export interface VariantCombination {
  id: string
  productId: string
  price: number
  status: 'active' | 'inactive'
  stock: number
  sortOrder: number
  // Store selected options as JSON string or object
  options: Record<string, string> // attributeId -> optionId
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  durationValue: number
  durationUnit: 'Jam' | 'Hari' | 'Bulan' | 'Lifetime'
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
  variantAttributes?: VariantAttribute[]
  attributeOptions?: AttributeOption[]
  variantCombinations?: VariantCombination[]
}
