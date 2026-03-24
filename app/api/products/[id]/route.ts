import { NextRequest, NextResponse } from 'next/server'
import { getGoogleSheetsData } from '@/lib/googleSheets'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const products = await getGoogleSheetsData()
    const product = products.find((p: any) => p.id === params.id)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Produk tidak ditemukan',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data produk',
      },
      { status: 500 }
    )
  }
}
