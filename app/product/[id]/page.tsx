import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'
import { getGoogleSheetsData, getVariantCombinations, getVariantAttributes, getAttributeOptions } from '@/lib/googleSheets'
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
  options: Record<string, string> // attributeId -> optionId
}

interface Product {
  id: string
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  description?: string
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
    options: Record<string, string> // attributeId -> optionId
  }>
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  try {
    const products = await getGoogleSheetsData()
    const product = products.find((p: any) => p.id === params.id)

    if (!product) {
      notFound()
    }

    // Fetch variant attributes, options, and combinations for this product
    const [attributes, options, combinations] = await Promise.all([
      getVariantAttributes(product.id),
      getAttributeOptions(product.id), // This will need productId - we'll need to adjust
      getVariantCombinations(product.id)
    ])

    // Filter active variants
    const activeAttributes = attributes.filter((a: any) => a.status === 'active')
    const activeOptions = options.filter((o: any) => o.status === 'active')
    const activeCombinations = combinations.filter((c: any) => c.status === 'active')

    // Parse options JSON if needed
    const parsedCombinations = combinations.map((combo: any) => {
      if (combo.options && typeof combo.options === 'string') {
        try {
          return { ...combo, options: JSON.parse(combo.options) }
        } catch {
          return { ...combo, options: {} }
        }
      }
      return combo
    })

    const activeCombinations = parsedCombinations.filter((c: any) => c.status === 'active')

    // Build attribute options map for client
    const attributesWithOptions = activeAttributes.map(attr => ({
      ...attr,
      options: activeOptions.filter(opt => opt.attributeId === attr.id)
    })

    // Build combinations with proper option names
    const combinationsWithNames = activeCombinations.map(combo => ({
      ...combo,
      options: Object.entries(combo.options || {}).map(([attrId, optId]) => {
        const attr = activeAttributes.find(a => a.id === attrId)
        const opt = activeOptions.find(o => o.id === optId)
        return {
          attributeName: attr?.name,
          optionName: opt?.name,
          optionId: optId
        }
      }).filter(Boolean)
    })

    const productWithVariants = {
      ...product,
      variantAttributes: activeAttributes,
      attributeOptions: activeOptions,
      variantCombinations: activeCombinations,
      variants: undefined // Remove old variants field
    }

    return (
      <ProductDetailClient 
        initialProduct={{
          ...productWithVariants,
          variants: activeCombinations.map(c => ({
            id: c.id,
            productId: c.productId,
            name: c.options.map(o => `${o.attributeName}: ${o.optionName}`).join(', '),
            durationValue: 0,
            durationUnit: 'Hari',
            price: c.price,
            status: c.status,
            sortOrder: c.sortOrder
          }))
        }
        formatPrice={formatPrice}
      />
    )
  } catch (error) {
    console.error('Error fetching product:', error)
    return <div>Error loading product</div>
  }
}