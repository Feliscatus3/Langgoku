import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        { success: false, message: 'GOOGLE_APPS_SCRIPT_URL not configured' },
        { status: 500 }
      )
    }

    const url = `${APPS_SCRIPT_URL}?action=getProductVariants&productId=${encodeURIComponent(params.id)}`
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching variants:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil varian' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        { success: false, message: 'GOOGLE_APPS_SCRIPT_URL not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { name, durationDays, price, status } = body

    if (!name || durationDays === undefined || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Field wajib: name, durationDays, price' },
        { status: 400 }
      )
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addProductVariant',
        productId: params.id,
        name,
        durationDays: parseInt(durationDays),
        price: parseInt(price),
        status: status || 'active'
      }),
      signal: AbortSignal.timeout(30000)
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error adding variant:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan varian' },
      { status: 500 }
    )
  }
}