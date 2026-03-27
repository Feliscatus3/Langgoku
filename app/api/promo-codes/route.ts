import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

// GET - Get all promo codes or validate a code
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  try {
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json({ success: false, message: 'Google Apps Script URL not configured' }, { status: 500 })
    }

    // If validating a specific code
    if (code) {
      const url = `${APPS_SCRIPT_URL}?action=validatePromoCode&code=${encodeURIComponent(code)}`
      const response = await fetch(url, { next: { revalidate: 60 } })
      const data = await response.json()
      return NextResponse.json(data)
    }

    // Otherwise get all promo codes
    const url = `${APPS_SCRIPT_URL}?action=getPromoCodes`
    const response = await fetch(url, { next: { revalidate: 60 } })
    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[PromoCodes] Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch promo codes' }, { status: 500 })
  }
}

// POST - Add new promo code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, discount, discountType, description, usageLimit, minPurchase, maxDiscount, expiryDate } = body

    if (!code || discount === undefined) {
      return NextResponse.json({ success: false, message: 'Kode promo dan diskon diperlukan' }, { status: 400 })
    }

    if (!APPS_SCRIPT_URL) {
      return NextResponse.json({ success: false, message: 'Google Apps Script URL not configured' }, { status: 500 })
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addPromoCode',
        code,
        discount,
        discountType: discountType || 'percentage',
        description: description || '',
        usageLimit: usageLimit || 0,
        minPurchase: minPurchase || 0,
        maxDiscount: maxDiscount || 0,
        expiryDate: expiryDate || ''
      })
    })

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[PromoCodes] Add Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to add promo code' }, { status: 500 })
  }
}

// PUT - Update promo code
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID diperlukan' }, { status: 400 })
    }

    if (!APPS_SCRIPT_URL) {
      return NextResponse.json({ success: false, message: 'Google Apps Script URL not configured' }, { status: 500 })
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updatePromoCode',
        id,
        ...body
      })
    })

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[PromoCodes] Update Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update promo code' }, { status: 500 })
  }
}

// DELETE - Delete promo code
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID diperlukan' }, { status: 400 })
    }

    if (!APPS_SCRIPT_URL) {
      return NextResponse.json({ success: false, message: 'Google Apps Script URL not configured' }, { status: 500 })
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deletePromoCode',
        id
      })
    })

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[PromoCodes] Delete Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete promo code' }, { status: 500 })
  }
}