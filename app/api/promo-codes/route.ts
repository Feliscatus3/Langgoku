import { NextRequest, NextResponse } from 'next/server'
import { appsScriptGet, appsScriptPost, isAppsScriptConfigured } from '@/lib/appsScriptClient'
import { isAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}

function notConfigured() {
  return NextResponse.json(
    { success: false, message: 'Google Apps Script URL not configured' },
    { status: 500 }
  )
}

// GET - validate a single code (public) or list all codes (admin only)
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  try {
    if (!isAppsScriptConfigured()) return notConfigured()

    if (code) {
      const data = await appsScriptGet('validatePromoCode', { code }, { revalidate: 0 })
      return NextResponse.json(data, { headers: NO_STORE })
    }

    if (!isAdminRequest(request)) return unauthorized()

    const data = await appsScriptGet('getPromoCodes', {}, { revalidate: 0 })
    return NextResponse.json(data, { headers: NO_STORE })
  } catch (error) {
    console.error('[PromoCodes] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch promo codes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const body = await request.json().catch(() => null)
    const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : ''
    const discount = Number(body?.discount)
    const discountType = body?.discountType === 'fixed' ? 'fixed' : 'percentage'

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Kode promo diperlukan' },
        { status: 400 }
      )
    }
    if (!Number.isFinite(discount) || discount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Diskon harus lebih dari 0' },
        { status: 400 }
      )
    }
    if (discountType === 'percentage' && discount > 100) {
      return NextResponse.json(
        { success: false, message: 'Diskon persen maksimal 100' },
        { status: 400 }
      )
    }

    if (!isAppsScriptConfigured()) return notConfigured()

    const data = await appsScriptPost({
      action: 'addPromoCode',
      code,
      discount,
      discountType,
      description: typeof body?.description === 'string' ? body.description : '',
      usageLimit: Number(body?.usageLimit) || 0,
      minPurchase: Number(body?.minPurchase) || 0,
      maxDiscount: Number(body?.maxDiscount) || 0,
      expiryDate: typeof body?.expiryDate === 'string' ? body.expiryDate : '',
      status: body?.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif',
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PromoCodes] Add Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add promo code' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID diperlukan' }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Body tidak valid' }, { status: 400 })
    }

    if (!isAppsScriptConfigured()) return notConfigured()

    const data = await appsScriptPost({
      action: 'updatePromoCode',
      id,
      code: typeof body.code === 'string' ? body.code.trim().toUpperCase() : undefined,
      discount: body.discount === undefined ? undefined : Number(body.discount),
      discountType: body.discountType === 'fixed' ? 'fixed' : body.discountType === 'percentage' ? 'percentage' : undefined,
      description: typeof body.description === 'string' ? body.description : undefined,
      usageLimit: body.usageLimit === undefined ? undefined : Number(body.usageLimit) || 0,
      minPurchase: body.minPurchase === undefined ? undefined : Number(body.minPurchase) || 0,
      maxDiscount: body.maxDiscount === undefined ? undefined : Number(body.maxDiscount) || 0,
      expiryDate: typeof body.expiryDate === 'string' ? body.expiryDate : undefined,
      status: body.status === 'Nonaktif' ? 'Nonaktif' : body.status === 'Aktif' ? 'Aktif' : undefined,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PromoCodes] Update Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update promo code' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID diperlukan' }, { status: 400 })
    }

    if (!isAppsScriptConfigured()) return notConfigured()

    const data = await appsScriptPost({ action: 'deletePromoCode', id })
    return NextResponse.json(data)
  } catch (error) {
    console.error('[PromoCodes] Delete Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete promo code' },
      { status: 500 }
    )
  }
}
