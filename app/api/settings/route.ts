import { NextRequest, NextResponse } from 'next/server'
import { appsScriptPost, isAppsScriptConfigured } from '@/lib/appsScriptClient'
import { getStoreSettings, invalidateStoreSettings } from '@/lib/storeSettings'
import { isAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

export async function GET(request: NextRequest) {
  try {
    if (!isAppsScriptConfigured()) {
      return NextResponse.json(
        { success: false, message: 'GOOGLE_APPS_SCRIPT_URL not configured', data: null },
        { status: 200, headers: NO_STORE }
      )
    }

    const settings = await getStoreSettings()

    if (!settings) {
      return NextResponse.json({ success: true, data: null }, { headers: NO_STORE })
    }

    // The Sheet ID is only useful to the admin panel.
    if (!isAdminRequest(request)) {
      const publicSettings = { ...settings }
      delete publicSettings.googleSheetId
      return NextResponse.json({ success: true, data: publicSettings }, { headers: NO_STORE })
    }

    return NextResponse.json({ success: true, data: settings }, { headers: NO_STORE })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings', data: null },
      { status: 200, headers: NO_STORE }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Body tidak valid' }, { status: 400 })
    }

    const adminPhone = typeof body.adminPhone === 'string' ? body.adminPhone.trim() : ''
    const storeEmail = typeof body.storeEmail === 'string' ? body.storeEmail.trim() : ''

    if (!adminPhone || !storeEmail) {
      return NextResponse.json(
        { success: false, message: 'Field wajib: adminPhone, storeEmail' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeEmail)) {
      return NextResponse.json(
        { success: false, message: 'Format email toko tidak valid' },
        { status: 400 }
      )
    }

    if (!isAppsScriptConfigured()) {
      return NextResponse.json(
        { success: false, message: 'GOOGLE_APPS_SCRIPT_URL not configured' },
        { status: 500 }
      )
    }

    const result = await appsScriptPost({
      action: 'saveSettings',
      googleSheetId: typeof body.googleSheetId === 'string' ? body.googleSheetId : '',
      adminPhone,
      storeEmail,
      storeName: typeof body.storeName === 'string' && body.storeName.trim() ? body.storeName.trim() : 'Langgoku',
      storeDescription: typeof body.storeDescription === 'string' ? body.storeDescription : '',
      defaultPaymentMethod:
        typeof body.defaultPaymentMethod === 'string' ? body.defaultPaymentMethod : 'QRIS',
      notificationEnabled: body.notificationEnabled !== false,
      maintenanceMode: body.maintenanceMode === true,
      announcementText: typeof body.announcementText === 'string' ? body.announcementText : '',
      announcementEnabled: body.announcementEnabled === true,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Gagal menyimpan pengaturan' },
        { status: 500 }
      )
    }

    invalidateStoreSettings()

    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil disimpan ke Google Sheets',
      data: body,
    })
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
