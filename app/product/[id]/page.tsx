import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'
import { getGoogleSheetsData, getProductVariants } from '@/lib/googleSheets'
import { formatPrice } from '@/lib/googleSheets'

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
  description?: string
  variants?: ProductVariant[]
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: 'Detail Produk - Langgoku',
    description: 'Informasi lengkap produk premium digital'
  }
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  try {
    const products = await getGoogleSheetsData()
    const product = products.find((p: any) => p.id === params.id)

    if (!product) {
      notFound()
    }

    // Fetch variants for this product
    const variants = await getProductVariants(product.id)
    const activeVariants = variants.filter((v: any) => v.status === 'active')

    const productWithVariants = {
      ...product,
      variants: activeVariants
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