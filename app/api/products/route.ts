import { NextRequest, NextResponse } from 'next/server'
import { getProductsWithVariants } from '@/lib/googleSheets'
import { isAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
}
const PRIVATE_CACHE_HEADERS = { 'Cache-Control': 'no-store' }

export async function GET(request: NextRequest) {
  try {
    const wantsAll = request.nextUrl.searchParams.get('all') === '1'
    const isAdmin = wantsAll && isAdminRequest(request)
    const headers = isAdmin ? PRIVATE_CACHE_HEADERS : PUBLIC_CACHE_HEADERS

    const products = await getProductsWithVariants({
      includeInactive: isAdmin,
      noCache: isAdmin,
    })

    if (products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Data produk belum terhubung atau kosong',
          data: [],
        },
        { status: 200, headers }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Produk berhasil diambil',
        data: products,
      },
      { headers }
    )
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data produk',
        data: [],
      },
      { status: 200, headers: PUBLIC_CACHE_HEADERS }
    )
  }
}
