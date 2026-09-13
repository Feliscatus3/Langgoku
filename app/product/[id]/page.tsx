import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'
import { getGoogleSheetsData, getVariantAttributes, getAttributeOptions, getVariantCombinations } from '@/lib/googleSheets'
import { formatPrice } from '@/lib/googleSheets'

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
  options: Record<string, string>
}

interface Product {
  id: string
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  description?: string
  variantAttributes?: VariantAttribute[]
  attributeOptions?: AttributeOption[]
  variantCombinations?: VariantCombination[]
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  try {
    const products = await getGoogleSheetsData()
    const product = products.find((p: any) => p.id === params.id)

    if (!product) {
      notFound()
    }

    // Fetch variant attributes for this product
    const attributes = await getVariantAttributes(product.id)
    const activeAttributes: VariantAttribute[] = attributes.filter((a: any) => a.status === 'active')

    // Fetch options for each attribute
    let allOptions: AttributeOption[] = []
    for (const attr of activeAttributes) {
      const options = await getAttributeOptions(attr.id)
      const activeOptions = options.filter((o: any) => o.status === 'active')
      allOptions.push(...activeOptions)
    }

    // Fetch variant combinations for this product
    const combinations = await getVariantCombinations(product.id)

    // Filter active combinations
    const activeCombinations = combinations.filter((c: any) => c.status === 'active')

    // Build product with variant data
    const productWithVariants = {
      ...product,
      variantAttributes: activeAttributes,
      attributeOptions: allOptions,
      variantCombinations: activeCombinations,
    }

    return (
      <ProductDetailClient
        initialProduct={productWithVariants}
        formatPrice={formatPrice}
      />
    )
  } catch (error) {
    console.error('Error fetching product:', error)
    return <div>Error loading product</div>
  }
}