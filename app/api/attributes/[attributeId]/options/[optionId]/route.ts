import { NextRequest, NextResponse } from 'next/server'
import {
  deleteAttributeOptionFromGoogleSheets,
  updateAttributeOptionInGoogleSheets,
} from '@/lib/googleSheets'
import { isAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { attributeId: string; optionId: string } }
) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Body tidak valid' }, { status: 400 })
    }

    await updateAttributeOptionInGoogleSheets({
      id: params.optionId,
      name: typeof body.name === 'string' ? body.name.trim() : undefined,
      sortOrder: body.sortOrder === undefined ? undefined : Number(body.sortOrder),
      status: body.status === 'inactive' ? 'inactive' : body.status === 'active' ? 'active' : undefined,
    })

    return NextResponse.json({ success: true, message: 'Opsi berhasil diperbarui' })
  } catch (error) {
    console.error('Error updating attribute option:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memperbarui opsi atribut: ' + (error instanceof Error ? error.message : 'Unknown'),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { attributeId: string; optionId: string } }
) {
  if (!isAdminRequest(request)) return unauthorized()

  try {
    await deleteAttributeOptionFromGoogleSheets(params.optionId)
    return NextResponse.json({ success: true, message: 'Opsi berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting attribute option:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menghapus opsi atribut: ' + (error instanceof Error ? error.message : 'Unknown'),
      },
      { status: 500 }
    )
  }
}
