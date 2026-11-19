import { NextRequest, NextResponse } from 'next/server'
import {
  deleteBuyerFromSheet,
  getBuyerFromSheet,
  updateBuyerInSheet,
} from '@/lib/googleAppsScript'
import { isAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const result = await getBuyerFromSheet(params.id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Pembeli tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error fetching buyer:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pembeli' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const body = await request.json().catch(() => null)
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    const product = typeof body?.product === 'string' ? body.product.trim() : ''
    const duration = typeof body?.duration === 'string' ? body.duration.trim() : ''
    const startDate = typeof body?.startDate === 'string' ? body.startDate.trim() : ''

    if (!name || !phone || !product || !duration || !startDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Field wajib: name, phone, product, duration, startDate',
        },
        { status: 400 }
      )
    }

    const result = await updateBuyerInSheet({
      id: params.id,
      name,
      phone,
      product,
      duration,
      startDate,
      endDate: typeof body?.endDate === 'string' ? body.endDate : '',
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
      data: { id: params.id, name, phone, product, duration, startDate },
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
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const result = await deleteBuyerFromSheet(params.id)

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
      data: { id: params.id },
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
