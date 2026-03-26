import { NextRequest, NextResponse } from 'next/server'
import { getBuyerFromSheet, updateBuyerInSheet, deleteBuyerFromSheet } from '@/lib/googleAppsScript'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getBuyerFromSheet(params.id)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Pembeli tidak ditemukan',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Error fetching buyer:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data pembeli',
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
    const { name, phone, product, duration, startDate, endDate } = body

    // Validasi required fields
    if (!name || !phone || !product || !duration || !startDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Field wajib: name, phone, product, duration, startDate',
        },
        { status: 400 }
      )
    }

    // Update di Google Sheets via Apps Script
    const result = await updateBuyerInSheet({
      id,
      name,
      phone,
      product,
      duration,
      startDate,
      endDate: endDate || '',
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal memperbarui data pembeli di Google Sheets',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Data pembeli berhasil diperbarui',
      data: {
        id,
        name,
        phone,
        product,
        duration,
        startDate,
        endDate,
      },
    })
  } catch (error) {
    console.error('Error updating buyer:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memperbarui pembeli: ' + (error instanceof Error ? error.message : 'Unknown error'),
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
          message: 'ID pembeli diperlukan',
        },
        { status: 400 }
      )
    }

    // Hapus dari Google Sheets via Apps Script
    const result = await deleteBuyerFromSheet(id)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal menghapus data pembeli dari Google Sheets',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Data pembeli berhasil dihapus',
      data: { id },
    })
  } catch (error) {
    console.error('Error deleting buyer:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menghapus pembeli: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}
