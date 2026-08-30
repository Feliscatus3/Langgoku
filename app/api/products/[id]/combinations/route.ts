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

    const url = `${APPS_SCRIPT_URL}?action=getVariantCombinations&productId=${encodeURIComponent(params.id)}`
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
    const result = await response.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching variant combinations:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil kombinasi varian' },
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
    const { price, status, stock, options } = body

    if (price === undefined || !options || Object.keys(options).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Field wajib: price, options' },
        { status: 400 }
      )
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addVariantCombination',
        productId: params.id,
        price: parseInt(price),
        status: status || 'active',
        stock: stock !== undefined ? parseInt(stock) : 0,
        options
      }),
      signal: AbortSignal.timeout(30000)
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error adding variant combination:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan kombinasi varian' },
      { status: 500 }
    )
  }
}