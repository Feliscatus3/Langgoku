import { NextRequest, NextResponse } from 'next/server'
import { appsScriptGet } from '@/lib/appsScriptClient'
import { addAttributeOptionToGoogleSheets } from '@/lib/googleSheets'
import { isAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { attributeId: string } }
) {
  try {
    const result = await appsScriptGet(
      'getAttributeOptions',
      { attributeId: params.attributeId },
      { revalidate: 0 }
    )
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error fetching attribute options:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil opsi atribut' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { attributeId: string } }
) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const body = await request.json().catch(() => null)
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const status = body?.status === 'inactive' ? 'inactive' : 'active'

    if (!name) {
      return NextResponse.json({ success: false, message: 'Field wajib: name' }, { status: 400 })
    }

    await addAttributeOptionToGoogleSheets({ attributeId: params.attributeId, name, status })
    return NextResponse.json({ success: true, message: 'Opsi berhasil ditambahkan' })
  } catch (error) {
    console.error('Error adding attribute option:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menambahkan opsi atribut: ' + (error instanceof Error ? error.message : 'Unknown'),
      },
      { status: 500 }
    )
  }
}
