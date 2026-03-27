import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

// GET - Get all promo ads
export async function GET(request: NextRequest) {
  try {
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json({ success: false, message: 'Google Apps Script URL not configured' }, { status: 500 })
    }

    const url = `${APPS_SCRIPT_URL}?action=getPromoAds`
    const response = await fetch(url, { next: { revalidate: 60 } })
    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[PromoAds] Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch promo ads' }, { status: 500 })
  }
}

// POST - Add new promo ad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, title, description, linkUrl, isActive } = body

    if (!imageUrl) {
      return NextResponse.json({ success: false, message: 'URL gambar diperlukan' }, { status: 400 })
    }

    if (!APPS_SCRIPT_URL) {
      return NextResponse.json({ success: false, message: 'Google Apps Script URL not configured' }, { status: 500 })
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addPromoAd',
        imageUrl,
        title: title || '',
        description: description || '',
        linkUrl: linkUrl || '',
        isActive: isActive !== false
      })
    })

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[PromoAds] Add Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to add promo ad' }, { status: 500 })
  }
}

// PUT - Update promo ad
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
        action: 'updatePromoAd',
        id,
        ...body
      })
    })

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[PromoAds] Update Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update promo ad' }, { status: 500 })
  }
}

// DELETE - Delete promo ad
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
        action: 'deletePromoAd',
        id
      })
    })

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[PromoAds] Delete Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete promo ad' }, { status: 500 })
  }
}