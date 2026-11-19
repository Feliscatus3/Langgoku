import 'server-only'
import crypto from 'crypto'

const CLIENT_ID = (process.env.DOKU_CLIENT_ID || '').trim()
const SECRET_KEY = (process.env.DOKU_SECRET_KEY || '').trim()
const IS_PRODUCTION = process.env.DOKU_IS_PRODUCTION === 'true'

export const DOKU_CHECKOUT_TARGET = '/checkout/v1/payment'

export function isDokuConfigured(): boolean {
  return CLIENT_ID.length > 0 && SECRET_KEY.length > 0
}

export function getDokuClientId(): string {
  return CLIENT_ID
}

export function getDokuBaseUrl(): string {
  return IS_PRODUCTION ? 'https://api.doku.com' : 'https://api-sandbox.doku.com'
}

/** DOKU expects a UTC timestamp without milliseconds. */
export function dokuTimestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

function digest(body: string): string {
  return crypto.createHash('sha256').update(body, 'utf8').digest('base64')
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET_KEY).update(payload, 'utf8').digest('base64')
}

/**
 * DOKU Checkout signature:
 * HMAC-SHA256(Client-Id + Request-Id + Request-Timestamp + Request-Target + Digest)
 */
export function createCheckoutSignature(
  requestId: string,
  timestamp: string,
  target: string,
  body: string
): string {
  return sign(CLIENT_ID + requestId + timestamp + target + digest(body))
}

/**
 * DOKU SNAP (virtual account / JAGOPAY) signature:
 * HMAC-SHA256(Client-Id + Timestamp + Request-Target + Digest)
 */
export function createSnapSignature(timestamp: string, target: string, body: string): string {
  return sign(CLIENT_ID + timestamp + target + digest(body))
}

export function formatPhoneForDoku(phone: string): string {
  let formatted = String(phone || '').replace(/\D/g, '')
  if (formatted.startsWith('0')) formatted = formatted.slice(1)
  if (!formatted.startsWith('62')) formatted = `62${formatted}`
  return formatted
}

export function generateRequestId(): string {
  return `REQ_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
}

/**
 * Storefront payment method -> DOKU channel codes.
 * Values must match DOKU's enabled channels for the merchant account.
 */
const PAYMENT_METHOD_MAP: Record<string, string[]> = {
  VIRTUAL_ACCOUNT_BCA: ['VIRTUAL_ACCOUNT_BCA'],
  VIRTUAL_ACCOUNT_BRI: ['VIRTUAL_ACCOUNT_BRI'],
  VIRTUAL_ACCOUNT_MANDIRI: ['VIRTUAL_ACCOUNT_BANK_MANDIRI'],
  VIRTUAL_ACCOUNT_BSI: ['VIRTUAL_ACCOUNT_BANK_SYARIAH_INDONESIA'],
  VIRTUAL_ACCOUNT_BNI: ['VIRTUAL_ACCOUNT_BNI'],
  VIRTUAL_ACCOUNT_PERMATA: ['VIRTUAL_ACCOUNT_BANK_PERMATA'],
  VIRTUAL_ACCOUNT_DANAMON: ['VIRTUAL_ACCOUNT_BANK_DANAMON'],
  VIRTUAL_ACCOUNT_CIMB: ['VIRTUAL_ACCOUNT_BANK_CIMB'],
  VIRTUAL_ACCOUNT_BTN: ['VIRTUAL_ACCOUNT_BTN'],
  E_WALLET_DANA: ['EMONEY_DANA'],
  E_WALLET_OVO: ['EMONEY_OVO'],
  E_WALLET_SHOPEEPAY: ['EMONEY_SHOPEEPAY'],
  E_WALLET_LINKAJA: ['EMONEY_LINKAJA'],
  QRIS: ['QRIS'],
  CREDIT_CARD: ['CREDIT_CARD'],
  DIRECT_DEBIT_BRI: ['DIRECT_DEBIT_BRI'],
  RETAIL_ALFAMART: ['ONLINE_TO_OFFLINE_ALFA'],
  RETAIL_INDOMARET: ['ONLINE_TO_OFFLINE_INDOMARET'],
  PAYLATER_AKULAKU: ['PEER_TO_PEER_AKULAKU'],
  PAYLATER_KREDIVO: ['PEER_TO_PEER_KREDIVO'],
  PAYLATER_INDODANA: ['PEER_TO_PEER_INDODANA'],
}

export function getDokuPaymentMethods(paymentMethod: string | undefined): string[] {
  return PAYMENT_METHOD_MAP[String(paymentMethod || '')] || ['QRIS']
}

