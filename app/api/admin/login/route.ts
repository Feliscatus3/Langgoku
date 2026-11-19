import { NextRequest, NextResponse } from 'next/server'
import {
  clearAdminCookie,
  isAdminRequest,
  isAuthConfigured,
  setAdminCookie,
  validateAdminCredentials,
} from '@/lib/auth'
import {
  clearLoginFailures,
  getClientKey,
  isLoginRateLimited,
  pruneLoginBuckets,
  recordLoginFailure,
} from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: true, authenticated: isAdminRequest(request) },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthConfigured()) {
      console.error('[AdminLogin] ADMIN_USERNAME/ADMIN_PASSWORD belum dikonfigurasi')
      return NextResponse.json(
        { success: false, message: 'Login admin belum dikonfigurasi di server' },
        { status: 500 }
      )
    }

    const body = await request.json().catch(() => null)
    const username = typeof body?.username === 'string' ? body.username.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password harus diisi' },
        { status: 400 }
      )
    }

    const clientKey = getClientKey(request.headers)
    pruneLoginBuckets()

    if (isLoginRateLimited(clientKey)) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak percobaan login. Coba lagi nanti.' },
        { status: 429 }
      )
    }

    if (!validateAdminCredentials(username, password)) {
      recordLoginFailure(clientKey)
      return NextResponse.json(
        { success: false, message: 'Username atau password salah' },
        { status: 401 }
      )
    }

    clearLoginFailures(clientKey)

    const response = NextResponse.json({ success: true, message: 'Login berhasil' })
    setAdminCookie(response, request)
    return response
  } catch (error) {
    console.error('[AdminLogin] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' })
  clearAdminCookie(response, request)
  return response
}
