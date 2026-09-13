import { NextRequest, NextResponse } from 'next/server'
import { getGoogleSheetsData, getVariantAttributes, getAttributeOptions, getVariantCombinations } from '@/lib/googleSheets'

// Cache for variant data to avoid repeated fetches
let variantDataCache: Map<string, any> = new Map()
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getCachedVariantData(productId: string) {
  const now = Date.now()
  if (now - cacheTimestamp > CACHE_TTL) {
    variantDataCache.clear()
    cacheTimestamp = now
  }
  
  if (variantDataCache.has(productId)) {
    return variantDataCache.get(productId)!
  }
  
  // Fetch variant attributes for this product
  const attributes = await getVariantAttributes(productId)
  const activeAttributes = attributes.filter((a: any) => a.status === 'active')

  // Fetch options for each attribute
  let allOptions: any[] = []
  for (const attr of activeAttributes) {
    const options = await getAttributeOptions(attr.id)
    const activeOptions = options.filter((o: any) => o.status === 'active')
    allOptions.push(...activeOptions)
  }

  // Fetch variant combinations for this product
  const combinations = await getVariantCombinations(productId)
  const activeCombinations = combinations.filter((c: any) => c.status === 'active')

  const variantData = {
    variantAttributes: activeAttributes,
    attributeOptions: allOptions,
    variantCombinations: activeCombinations
  }
  
  variantDataCache.set(productId, variantData)
  return variantData
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

    // Fetch variant data for all products in parallel
    const productsWithVariants = await Promise.all(
      products.map(async (product: any) => {
        const variantData = await getCachedVariantData(product.id)
        return {
          ...product,
          ...variantData
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