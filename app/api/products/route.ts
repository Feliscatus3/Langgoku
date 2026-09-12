import { NextRequest, NextResponse } from 'next/server'
import { getGoogleSheetsData, getProductVariants } from '@/lib/googleSheets'

// Cache for product variants to avoid repeated fetches
let variantsCache: Map<string, any[]> = new Map()
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getCachedVariants(productId: string) {
  const now = Date.now()
  if (now - cacheTimestamp > CACHE_TTL) {
    variantsCache.clear()
    cacheTimestamp = now
  }
  
  if (variantsCache.has(productId)) {
    return variantsCache.get(productId)!
  }
  
  const variants = await getProductVariants(productId)
  const activeVariants = variants.filter((v: any) => v.status === 'active')
  variantsCache.set(productId, activeVariants)
  return activeVariants
}

export async function GET(request: NextRequest) {
  try {
    const products = await getGoogleSheetsData()
    
    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Data produk belum terhubung atau kosong',
          data: [],
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
          }
        }
      )
    }

    // Fetch variants for all products in parallel
    const productsWithVariants = await Promise.all(
      products.map(async (product: any) => {
        const activeVariants = await getCachedVariants(product.id)
        return {
          ...product,
          variants: activeVariants
        }
      })
    )

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diambil',
      data: productsWithVariants,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data produk',
        data: [],
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    )
  }
}