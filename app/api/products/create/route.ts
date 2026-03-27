import { NextRequest, NextResponse } from 'next/server'

// Support both local and Vercel environment variables
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, duration, stock, image, description } = body

    console.log('[API] Create product request:', { name, price, duration, stock })

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
      console.error('[API] GOOGLE_APPS_SCRIPT_URL not set in environment')
      return NextResponse.json(
        {
          success: false,
          message: 'GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi. Silakan tambahkan di Vercel project settings.',
        },
        { status: 500 }
      )
    }

    console.log('[API] Calling Google Apps Script:', APPS_SCRIPT_URL)

    // Kirim data ke Google Apps Script - action included in body
    const url = APPS_SCRIPT_URL
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addProduct',
        name,
        price,
        duration,
        stock,
        image,
        description,
      }),
      signal: AbortSignal.timeout(30000)
    })

    console.log('[API] Response status:', response.status)

    const result = await response.json()
    console.log('[API] Response data:', result)

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
    console.error('[API] Error creating product:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menambahkan produk: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}