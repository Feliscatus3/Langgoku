import { NextRequest, NextResponse } from 'next/server'

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

export async function GET(request: NextRequest) {
  try {
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json({
        success: false,
        message: 'GOOGLE_APPS_SCRIPT_URL not configured',
        data: null
      }, { status: 200 })
    }

    const url = `${APPS_SCRIPT_URL}?action=getSettings`
    const response = await fetch(url, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(30000)
    })

    const data = await response.json()

    if (data.success && data.data) {
      return NextResponse.json({
        success: true,
        data: data.data
      })
    }

    return NextResponse.json({
      success: true,
      data: null
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch settings',
      data: null
    }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      googleSheetId, 
      adminPhone, 
      storeEmail, 
      storeName, 
      storeDescription,
      defaultPaymentMethod,
      notificationEnabled 
    } = body

    // Validate required fields
    if (!adminPhone || !storeEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'Field wajib: adminPhone, storeEmail',
        },
        { status: 400 }
      )
    }

    if (!APPS_SCRIPT_URL) {
      return NextResponse.json(
        {
          success: false,
          message: 'GOOGLE_APPS_SCRIPT_URL not configured',
        },
        { status: 500 }
      )
    }

    // Save to Google Apps Script
    const url = APPS_SCRIPT_URL
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'saveSettings',
        googleSheetId: googleSheetId || '',
        adminPhone,
        storeEmail,
        storeName: storeName || 'Langgoku',
        storeDescription: storeDescription || '',
        defaultPaymentMethod: defaultPaymentMethod || 'QRIS',
        notificationEnabled: notificationEnabled !== false,
      }),
      signal: AbortSignal.timeout(30000)
    })

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Pengaturan berhasil disimpan ke Google Sheets',
        data: body
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Gagal menyimpan pengaturan',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menyimpan pengaturan: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}