import { NextRequest, NextResponse } from 'next/server'
import { getGoogleSheetsData, getProductVariants } from '@/lib/googleSheets'

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
        { status: 200 }
      )
    }

    // Fetch variants for each product
    const productsWithVariants = await Promise.all(
      products.map(async (product: any) => {
        const variants = await getProductVariants(product.id)
        // Filter only active variants
        const activeVariants = variants.filter((v: any) => v.status === 'active')
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
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data produk',
        data: [],
      },
      { status: 200 }
    )
  }
}