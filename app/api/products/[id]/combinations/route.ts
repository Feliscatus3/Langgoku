import { NextRequest, NextResponse } from 'next/server'
import { addVariantCombinationToGoogleSheets, getVariantCombinations } from '@/lib/googleSheets'
import { isAdminRequest } from '@/lib/auth'
import { parseNumber } from '@/lib/format'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getVariantCombinations(params.id)
    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'no-store' } }
    )
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
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const body = await request.json().catch(() => null)
    const price = parseNumber(body?.price)
    const options = body?.options

    if (!body || !Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: 'Field wajib: price yang valid' },
        { status: 400 }
      )
    }
    if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).length === 0) {
      return NextResponse.json({ success: false, message: 'Field wajib: options' }, { status: 400 })
    }

    await addVariantCombinationToGoogleSheets({
      productId: params.id,
      price,
      status: body.status === 'inactive' ? 'inactive' : 'active',
      stock: body.stock === undefined ? 0 : parseNumber(body.stock),
      options: options as Record<string, string>,
    })

    return NextResponse.json({ success: true, message: 'Kombinasi berhasil ditambahkan' })
  } catch (error) {
    console.error('Error adding variant combination:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menambahkan kombinasi varian: ' + (error instanceof Error ? error.message : 'Unknown'),
      },
      { status: 500 }
    )
  }
}
