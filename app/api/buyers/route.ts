import { NextRequest, NextResponse } from 'next/server'
import { getBuyersFromSheet, addBuyerToSheet } from '@/lib/googleAppsScript'

export async function GET(request: NextRequest) {
  try {
    const result = await getBuyersFromSheet()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal mengambil data pembeli',
          data: [],
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Data pembeli berhasil diambil',
      data: result.data || [],
      count: result.count || 0,
    })
  } catch (error) {
    console.error('Error fetching buyers:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data pembeli: ' + (error instanceof Error ? error.message : 'Unknown error'),
        data: [],
      },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, product, duration, startDate, endDate } = body

    // Validasi required fields
    if (!name || !phone || !product || !duration || !startDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Field wajib: name, phone, product, duration, startDate',
        },
        { status: 400 }
      )
    }

    // Simpan ke Google Sheets via Apps Script
    const result = await addBuyerToSheet({
      name,
      phone,
      product,
      duration,
      startDate,
      endDate: endDate || '',
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal menyimpan data pembeli ke Google Sheets',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Data pembeli berhasil ditambahkan',
      data: {
        id: result.data?.id || `buyer-${Date.now()}`,
        name,
        phone,
        product,
        duration,
        startDate,
        endDate,
      },
    })
  } catch (error) {
    console.error('Error creating buyer:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menambahkan pembeli: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}
