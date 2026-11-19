import { NextRequest, NextResponse } from 'next/server'
import { appsScriptGet, appsScriptPost, isAppsScriptConfigured } from '@/lib/appsScriptClient'
import { isAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PUBLIC_CACHE = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }

function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}

function notConfigured() {
  return NextResponse.json(
    { success: false, message: 'Google Apps Script URL not configured' },
    { status: 500 }
  )
}

function validHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// GET - public: the storefront popup needs the active ads
export async function GET() {
  try {
    if (!isAppsScriptConfigured()) return notConfigured()

    const data = await appsScriptGet('getPromoAds', {}, { revalidate: 60 })
    return NextResponse.json(data, { headers: PUBLIC_CACHE })
  } catch (error) {
    console.error('[PromoAds] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch promo ads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const body = await request.json().catch(() => null)
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : ''

    if (!validHttpUrl(imageUrl)) {
      return NextResponse.json(
        { success: false, message: 'URL gambar tidak valid' },
        { status: 400 }
      )
    }

    if (!isAppsScriptConfigured()) return notConfigured()

    const data = await appsScriptPost({
      action: 'addPromoAd',
      imageUrl,
      title: typeof body?.title === 'string' ? body.title : '',
      description: typeof body?.description === 'string' ? body.description : '',
      linkUrl: validHttpUrl(body?.linkUrl) ? body.linkUrl : '',
      isActive: body?.isActive !== false,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PromoAds] Add Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add promo ad' },
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
      action: 'updatePromoAd',
      id,
      imageUrl: validHttpUrl(body.imageUrl) ? body.imageUrl : undefined,
      title: typeof body.title === 'string' ? body.title : undefined,
      description: typeof body.description === 'string' ? body.description : undefined,
      linkUrl: typeof body.linkUrl === 'string' ? body.linkUrl : undefined,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PromoAds] Update Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update promo ad' },
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

    const data = await appsScriptPost({ action: 'deletePromoAd', id })
    return NextResponse.json(data)
  } catch (error) {
    console.error('[PromoAds] Delete Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete promo ad' },
      { status: 500 }
    )
  }
}
