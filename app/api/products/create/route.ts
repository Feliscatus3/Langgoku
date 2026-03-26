import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL

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

    // Cek apakah GOOGLE_APPS_SCRIPT_URL sudah dikonfigurasi
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        {
          success: false,
          message: 'GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi di .env.local',
        },
        { status: 500 }
      )
    }

    // Kirim data ke Google Apps Script
    const url = `${APPS_SCRIPT_URL}?action=addProduct`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        name,
        price,
        duration,
        stock,
        image,
        description,
      }),
    })

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || 'Produk berhasil ditambahkan',
        data: result.data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal menambahkan produk',
        },
        { status: 500 }
      )
    }
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