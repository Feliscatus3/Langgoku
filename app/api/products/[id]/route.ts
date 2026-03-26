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

    // TODO: Integrate dengan Google Sheets API atau database untuk update
    // Saat ini return success response untuk placeholder
    // Implementation akan menggunakan Google Sheets API dengan write access

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diperbarui',
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
    console.error('Error updating product:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memperbarui produk',
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

    // TODO: Integrate dengan Google Sheets API atau database untuk delete
    // Saat ini return success response untuk placeholder
    // Implementation akan menggunakan Google Sheets API dengan write access

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus',
      data: { id },
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menghapus produk',
      },
      { status: 500 }
    )
  }
}
