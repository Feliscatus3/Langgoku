import { NextRequest, NextResponse } from 'next/server'
import { addProductToGoogleSheets } from '@/lib/googleSheets'
import { isAdminRequest } from '@/lib/auth'
import { parseNumber } from '@/lib/format'
import { isValidImageSource, truncate } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Body tidak valid' }, { status: 400 })
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const price = parseNumber(body.price)
    const image = typeof body.image === 'string' ? body.image.trim() : ''
    const description = typeof body.description === 'string' ? body.description : ''

    if (!name) {
      return NextResponse.json({ success: false, message: 'Field wajib: name' }, { status: 400 })
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ success: false, message: 'Harga tidak valid' }, { status: 400 })
    }
    if (!isValidImageSource(image)) {
      return NextResponse.json(
        { success: false, message: 'URL gambar harus diawali http(s):// atau /images/' },
        { status: 400 }
      )
    }

    await addProductToGoogleSheets({
      name: truncate(name, 200),
      price,
      duration: body.duration === undefined ? '' : truncate(String(body.duration).trim(), 50),
      stock: body.stock === undefined ? 0 : parseNumber(body.stock),
      image,
      description: truncate(description, 5000),
      attributes: Array.isArray(body.attributes) ? body.attributes : [],
      options: Array.isArray(body.options) ? body.options : [],
      combinations: Array.isArray(body.combinations) ? body.combinations : [],
    })

    return NextResponse.json({ success: true, message: 'Produk berhasil ditambahkan' })
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
