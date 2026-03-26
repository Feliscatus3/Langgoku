import { NextRequest, NextResponse } from 'next/server'
import { addProductToSheet } from '@/lib/googleAppsScript'

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

    // Simpan ke Google Sheets via Apps Script
    const result = await addProductToSheet({
      name,
      price,
      duration,
      stock,
      image: image || '',
      description: description || '',
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal menyimpan produk ke Google Sheets',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: {
        id: result.data?.id || `product-${Date.now()}`,
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
        message: 'Gagal menambahkan produk: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}
