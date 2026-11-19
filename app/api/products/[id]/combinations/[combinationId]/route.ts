import { NextRequest, NextResponse } from 'next/server'
import {
  deleteVariantCombinationFromGoogleSheets,
  getVariantCombinations,
  updateVariantCombinationInGoogleSheets,
} from '@/lib/googleSheets'
import { isAdminRequest } from '@/lib/auth'
import { parseNumber } from '@/lib/format'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; combinationId: string } }
) {
  try {
    const combinations = await getVariantCombinations(params.id)
    const combination = combinations.find((item) => item.id === params.combinationId)

    if (!combination) {
      return NextResponse.json(
        { success: false, message: 'Kombinasi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: combination },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error fetching variant combination:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil kombinasi varian' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; combinationId: string } }
) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Body tidak valid' }, { status: 400 })
    }

    await updateVariantCombinationInGoogleSheets({
      id: params.combinationId,
      price: body.price === undefined ? undefined : parseNumber(body.price),
      status: body.status === 'inactive' ? 'inactive' : body.status === 'active' ? 'active' : undefined,
      stock: body.stock === undefined ? undefined : parseNumber(body.stock),
      sortOrder: body.sortOrder === undefined ? undefined : parseNumber(body.sortOrder),
      options: body.options && typeof body.options === 'object' ? body.options : undefined,
    })

    return NextResponse.json({ success: true, message: 'Kombinasi berhasil diperbarui' })
  } catch (error) {
    console.error('Error updating variant combination:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memperbarui kombinasi varian: ' + (error instanceof Error ? error.message : 'Unknown'),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; combinationId: string } }
) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    await deleteVariantCombinationFromGoogleSheets(params.combinationId)
    return NextResponse.json({ success: true, message: 'Kombinasi berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting variant combination:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menghapus kombinasi varian: ' + (error instanceof Error ? error.message : 'Unknown'),
      },
      { status: 500 }
    )
  }
}
