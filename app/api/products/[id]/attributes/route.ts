import { NextRequest, NextResponse } from 'next/server'
import { appsScriptGet } from '@/lib/appsScriptClient'
import { addVariantAttributeToGoogleSheets } from '@/lib/googleSheets'
import { isAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await appsScriptGet('getVariantAttributes', { productId: params.id }, { revalidate: 0 })
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
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
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const body = await request.json().catch(() => null)
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const status = body?.status === 'inactive' ? 'inactive' : 'active'

    if (!name) {
      return NextResponse.json({ success: false, message: 'Field wajib: name' }, { status: 400 })
    }

    await addVariantAttributeToGoogleSheets({ productId: params.id, name, status })
    return NextResponse.json({ success: true, message: 'Atribut berhasil ditambahkan' })
  } catch (error) {
    console.error('Error adding variant attribute:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menambahkan atribut varian: ' + (error instanceof Error ? error.message : 'Unknown'),
      },
      { status: 500 }
    )
  }
}
