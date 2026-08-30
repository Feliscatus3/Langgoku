import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; combinationId: string } }
) {
  try {
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        { success: false, message: 'GOOGLE_APPS_SCRIPT_URL not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { price, status, stock, sortOrder, options } = body

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateVariantCombination',
        id: params.combinationId,
        price: price !== undefined ? parseInt(price) : undefined,
        status,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        options
      }),
      signal: AbortSignal.timeout(30000)
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating variant combination:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui kombinasi varian' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; combinationId: string } }
) {
  try {
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        { success: false, message: 'GOOGLE_APPS_SCRIPT_URL not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteVariantCombination',
        id: params.combinationId
      }),
      signal: AbortSignal.timeout(30000)
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting variant combination:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus kombinasi varian' },
      { status: 500 }
    )
  }
}