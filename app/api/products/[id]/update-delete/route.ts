import { NextRequest, NextResponse } from 'next/server'

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

    // TODO: Update di Google Sheets atau database
    // Untuk sekarang, return success response

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

    // TODO: Hapus dari Google Sheets atau database
    // Untuk sekarang, return success response

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
