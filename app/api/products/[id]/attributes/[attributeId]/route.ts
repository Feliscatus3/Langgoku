import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; attributeId: string } }
) {
  try {
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        { success: false, message: 'GOOGLE_APPS_SCRIPT_URL not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { name, sortOrder, status } = body

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateVariantAttribute',
        id: params.attributeId,
        name,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        status
      }),
      signal: AbortSignal.timeout(30000)
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating variant attribute:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui atribut varian' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; attributeId: string } }
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
        action: 'deleteVariantAttribute',
        id: params.attributeId
      }),
      signal: AbortSignal.timeout(30000)
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting variant attribute:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus atribut varian' },
      { status: 500 }
    )
  }
}