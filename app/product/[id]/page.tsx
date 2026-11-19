import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'
import { getProductWithVariants } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  let product = null

  try {
    product = await getProductWithVariants(params.id)
  } catch (error) {
    console.error('Error fetching product:', error)
  }

  if (!product) {
    notFound()
  }

  return <ProductDetailClient initialProduct={product} />
}
