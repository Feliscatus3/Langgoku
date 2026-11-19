import { NextRequest, NextResponse } from 'next/server'
import {
  deleteProductFromGoogleSheets,
  getGoogleSheetsData,
  getProductWithVariants,
  updateProductInGoogleSheets,
} from '@/lib/googleSheets'
import { isAdminRequest } from '@/lib/auth'
import { parseNumber } from '@/lib/format'
import { isValidImageSource, truncate } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wantsAll = request.nextUrl.searchParams.get('all') === '1'
    const includeInactive = wantsAll && isAdminRequest(request)
    const product = await getProductWithVariants(params.id, {
      includeInactive,
      noCache: includeInactive,
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: product },
      {
        headers: includeInactive
          ? { 'Cache-Control': 'no-store' }
          : { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      }
    )
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data produk' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Body tidak valid' }, { status: 400 })
    }

    const existing = (await getGoogleSheetsData()).find((item) => item.id === params.id)
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Produk tidak ditemukan' }, { status: 404 })
    }

    const name = typeof body.name === 'string' ? body.name.trim() : existing.name
    const price = body.price === undefined ? existing.price : parseNumber(body.price)
    const image = body.image === undefined ? existing.image || '' : String(body.image).trim()
    const description =
      body.description === undefined ? existing.description || '' : String(body.description).trim()

    if (!name) {
      return NextResponse.json({ success: false, message: 'Nama produk wajib diisi' }, { status: 400 })
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

    await updateProductInGoogleSheets({
      id: params.id,
      name: truncate(name, 200),
      price,
      duration:
        body.duration === undefined
          ? existing.duration || ''
          : truncate(String(body.duration).trim(), 50),
      stock: body.stock === undefined ? existing.stock ?? 0 : parseNumber(body.stock),
      image,
      description: truncate(description, 5000),
    })

    return NextResponse.json({ success: true, message: 'Produk berhasil diperbarui' })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memperbarui produk: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (!params.id) {
      return NextResponse.json({ success: false, message: 'ID produk diperlukan' }, { status: 400 })
    }

    await deleteProductFromGoogleSheets(params.id)
    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus', data: { id: params.id } })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menghapus produk: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}
