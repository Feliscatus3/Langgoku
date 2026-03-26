import { NextRequest, NextResponse } from 'next/server'
import { getGoogleSheetsData } from '@/lib/googleSheets'

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

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diambil',
      data: products,
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