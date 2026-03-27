import { NextRequest, NextResponse } from 'next/server'

// Support both local and Vercel environment variables
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
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
          message: 'GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi',
        },
        { status: 500 }
      )
    }

    // Kirim data ke Google Apps Script untuk update
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateProduct',
        id,
        name,
        price,
        duration,
        stock,
        image,
        description,
      }),
      signal: AbortSignal.timeout(30000)
    })

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || 'Produk berhasil diperbarui',
        data: { id, name, price, duration, stock, image, description },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal memperbarui produk',
        },
        { status: 500 }
      )
    }
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
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID produk diperlukan',
        },
        { status: 400 }
      )
    }

    // Cek apakah GOOGLE_APPS_SCRIPT_URL sudah dikonfigurasi
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        {
          success: false,
          message: 'GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi',
        },
        { status: 500 }
      )
    }

    // Kirim request ke Google Apps Script untuk hapus
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deleteProduct',
        id,
      }),
      signal: AbortSignal.timeout(30000)
    })

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || 'Produk berhasil dihapus',
        data: { id },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal menghapus produk',
        },
        { status: 500 }
      )
    }
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