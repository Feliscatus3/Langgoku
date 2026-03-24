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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, duration, stock, image, description } = body

    // Validasi required fields
    if (!name || price === undefined || !duration || stock === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: 'Field wajib: name, price, duration, stock',
        },
        { status: 400 }
      )
    }

    // Generate unique ID
    const id = `product-${Date.now()}`

    // TODO: Simpan ke Google Sheets atau database
    // Untuk sekarang, return success response
    // Di production, integrate dengan Google Sheets API atau database

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: {
        id,
        name,
        price,
        duration,
        stock,
        image,
        description,
      },
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menambahkan produk',
      },
      { status: 500 }
    )
  }
}
