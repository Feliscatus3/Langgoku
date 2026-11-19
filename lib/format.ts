/**
 * Client-safe formatting and date helpers.
 * Keep this module free of server-only imports so it can be used from
 * client components without bundling the Google Apps Script data layer.
 */

const IDR_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatPrice(price: number | string | null | undefined): string {
  const value = typeof price === 'number' ? price : parseNumber(price)
  return IDR_FORMATTER.format(Number.isFinite(value) ? value : 0)
}

/**
 * Parses numbers coming from Google Sheets. Handles values such as
 * "Rp 99.000", "99,000.50", "1.234.567", and plain numbers.
 */
export function parseNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'bigint') return Number(value)
  if (value === null || value === undefined) return 0

  let text = String(value).trim()
  if (!text) return 0

  text = text.replace(/[^\d.,-]/g, '')
  if (!text) return 0

  const isNegative = text.startsWith('-')
  text = text.replace(/-/g, '')

  if (text.includes(',')) {
    // Indonesian format: dots are thousands separators, comma is decimal.
    text = text.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    // "1.234.567" style thousands separators.
    text = text.replace(/\./g, '')
  }

  const parsed = Number.parseFloat(text)
  if (!Number.isFinite(parsed)) return 0
  return isNegative ? -parsed : parsed
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const text = String(value).trim()
  if (!text) return null

  // Google Sheets may return dd/mm/yyyy; treat it as a local date.
  const ddMmYyyy = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (ddMmYyyy) {
    const [, day, month, year] = ddMmYyyy
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date
}

export function calculateRemainingDays(endDate: string | Date | null | undefined): number {
  const expiry = toDate(endDate)
  if (!expiry) return 0

  const today = new Date()
  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getSubscriptionStatus(remainingDays: number): 'active' | 'expiring' | 'expired' {
  if (!Number.isFinite(remainingDays) || remainingDays <= 0) return 'expired'
  if (remainingDays <= 3) return 'expiring'
  return 'active'
}

export function calculateExpiryDate(duration: string | null | undefined): Date {
  const date = new Date()
  const match = String(duration || '').match(/\d+/)
  const amount = match ? Number.parseInt(match[0], 10) : 1
  const text = String(duration || '').toLowerCase()

  if (text.includes('tahun')) {
    date.setFullYear(date.getFullYear() + amount)
  } else if (text.includes('minggu')) {
    date.setDate(date.getDate() + amount * 7)
  } else if (text.includes('hari')) {
    date.setDate(date.getDate() + amount)
  } else {
    date.setMonth(date.getMonth() + amount)
  }

  return date
}

export function formatDate(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string {
  const date = toDate(value)
  if (!date) return '-'
  return date.toLocaleDateString('id-ID', options)
}
