import 'server-only'
import crypto from 'crypto'
import type { NextRequest, NextResponse } from 'next/server'

export const ADMIN_COOKIE_NAME = 'admin_token'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function hash(value: string): Buffer {
  return crypto.createHash('sha256').update(value, 'utf8').digest()
}

function safeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(hash(a), hash(b))
}

function getAdminCredentials(): { username: string; password: string } {
  return {
    username: (process.env.ADMIN_USERNAME || '').trim(),
    password: process.env.ADMIN_PASSWORD || '',
  }
}

export function isAuthConfigured(): boolean {
  const { username, password } = getAdminCredentials()
  return Boolean(username && password)
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const expected = getAdminCredentials()
  if (!expected.username || !expected.password) return false

  const usernameMatches = safeEqual(String(username || ''), expected.username)
  const passwordMatches = safeEqual(String(password || ''), expected.password)
  return usernameMatches && passwordMatches
}

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
}

export function createAdminSessionToken(): string | null {
  const secret = getSessionSecret()
  if (!secret) return null

  const issuedAt = Date.now().toString()
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`admin:${issuedAt}`, 'utf8')
    .digest('hex')

  return `${issuedAt}.${signature}`
}

export function verifyAdminSessionToken(token: string | null | undefined): boolean {
  if (!token) return false

  const secret = getSessionSecret()
  if (!secret) return false

  const [issuedAt, signature] = token.split('.')
  if (!issuedAt || !signature || !/^\d+$/.test(issuedAt)) return false

  const age = Date.now() - Number(issuedAt)
  if (age < 0 || age > SESSION_TTL_MS) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`admin:${issuedAt}`, 'utf8')
    .digest()

  const provided = Buffer.from(signature, 'hex')
  if (provided.length !== expected.length) return false

  return crypto.timingSafeEqual(provided, expected)
}

export function isAdminRequest(request: NextRequest): boolean {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value)
}

function isSecureRequest(request?: NextRequest): boolean {
  if (!request) return process.env.NODE_ENV === 'production'

  const forwardedProto = request.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
    .toLowerCase()

  if (forwardedProto) return forwardedProto === 'https'
  if (request.nextUrl.protocol === 'https:') return true

  // `next start` locally runs over HTTP even though NODE_ENV is production.
  // Only force Secure when the public base URL is explicitly HTTPS.
  return (process.env.NEXT_PUBLIC_BASE_URL || '').startsWith('https://')
}

export function setAdminCookie(response: NextResponse, request?: NextRequest): void {
  const token = createAdminSessionToken()
  if (!token) {
    throw new Error('ADMIN_PASSWORD atau ADMIN_SESSION_SECRET belum dikonfigurasi')
  }

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export function clearAdminCookie(response: NextResponse, request?: NextRequest): void {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
