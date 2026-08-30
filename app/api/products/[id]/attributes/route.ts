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

    const url = `${APPS_SCRIPT_URL}?action=getVariantAttributes&productId=${encodeURIComponent(params.id)}`
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching variant attributes:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil atribut varian' },
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
    const { name, status } = body

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Field wajib: name' },
        { status: 400 }
      )
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addVariantAttribute',
        productId: params.id,
        name,
        status: status || 'active'
      }),
      signal: AbortSignal.timeout(30000)
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error adding variant attribute:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan atribut varian' },
      { status: 500 }
    )
  }
}