import { NextRequest, NextResponse } from 'next/server'
import { addBuyerToSheet, getBuyersFromSheet } from '@/lib/googleAppsScript'
import { isAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const result = await getBuyersFromSheet()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal mengambil data pembeli',
          data: [],
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Data pembeli berhasil diambil',
        data: result.data || [],
        count: result.count || 0,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error fetching buyers:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data pembeli: ' + (error instanceof Error ? error.message : 'Unknown error'),
        data: [],
      },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const result = await addBuyerToSheet({
      name,
      phone,
      product,
      duration,
      startDate,
      endDate: typeof body?.endDate === 'string' ? body.endDate : '',
      variantId: typeof body?.variantId === 'string' ? body.variantId : undefined,
      variantName: typeof body?.variantName === 'string' ? body.variantName : undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal menyimpan data pembeli ke Google Sheets',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Data pembeli berhasil ditambahkan',
      data: {
        id: (result.data as { id?: string } | undefined)?.id || `buyer-${Date.now()}`,
        name,
        phone,
        product,
        duration,
        startDate,
        endDate: typeof body?.endDate === 'string' ? body.endDate : '',
      },
    })
  } catch (error) {
    console.error('Error creating buyer:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menambahkan pembeli: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}
