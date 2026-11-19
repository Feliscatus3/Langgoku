import { NextRequest, NextResponse } from 'next/server'
import {
  createSnapSignature,
  dokuTimestamp,
  formatPhoneForDoku,
  getDokuBaseUrl,
  getDokuClientId,
  isDokuConfigured,
} from '@/lib/doku'

export const dynamic = 'force-dynamic'

const VA_TARGET = (process.env.DOKU_VA_TARGET || '/virtual-account/bank-transfer/va').trim()

const CHANNEL_MAP: Record<string, string> = {
  VIRTUAL_ACCOUNT_BCA: 'VIRTUAL_ACCOUNT_BCA',
  VIRTUAL_ACCOUNT_BRI: 'VIRTUAL_ACCOUNT_BRI',
  VIRTUAL_ACCOUNT_MANDIRI: 'VIRTUAL_ACCOUNT_BANK_MANDIRI',
  VIRTUAL_ACCOUNT_BNI: 'VIRTUAL_ACCOUNT_BNI',
  VIRTUAL_ACCOUNT_PERMATA: 'VIRTUAL_ACCOUNT_BANK_PERMATA',
  VIRTUAL_ACCOUNT_CIMB: 'VIRTUAL_ACCOUNT_BANK_CIMB',
  VIRTUAL_ACCOUNT_DANAMON: 'VIRTUAL_ACCOUNT_BANK_DANAMON',
  VIRTUAL_ACCOUNT_BSI: 'VIRTUAL_ACCOUNT_BANK_SYARIAH_INDONESIA',
}

export async function POST(request: NextRequest) {
  try {
    if (!isDokuConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Virtual Account DOKU belum dikonfigurasi. Hubungi admin via WhatsApp.',
        },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => null)
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : ''
    const amount = Math.round(Number(body?.amount))
    const buyerName = typeof body?.buyerName === 'string' ? body.buyerName.trim() : ''
    const buyerPhone = typeof body?.buyerPhone === 'string' ? body.buyerPhone.trim() : ''
    const paymentMethod = typeof body?.paymentMethod === 'string' ? body.paymentMethod : ''

    if (!orderId || !buyerName || !buyerPhone || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid required fields' },
        { status: 400 }
      )
    }

    const phone = formatPhoneForDoku(buyerPhone)
    const partnerServiceId = process.env.DOKU_PARTNER_SERVICE_ID || 'LANGGOKU'

    const dokuRequestBody = {
      partnerServiceId,
      customerNo: phone,
      virtualAccountNo: `${partnerServiceId}${phone}`,
      virtualAccountName: buyerName,
      trxId: orderId,
      totalAmount: {
        value: amount.toFixed(2),
        currency: 'IDR',
      },
      additionalInfo: {
        channel: CHANNEL_MAP[paymentMethod] || 'VIRTUAL_ACCOUNT_BCA',
      },
      virtualAccountTrxType: 'C',
    }

    const dokuBodyString = JSON.stringify(dokuRequestBody)
    const timestamp = dokuTimestamp()
    const signature = createSnapSignature(timestamp, VA_TARGET, dokuBodyString)

    const response = await fetch(`${getDokuBaseUrl()}${VA_TARGET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': getDokuClientId(),
        'X-Date': timestamp,
        'Request-Timestamp': timestamp,
        Signature: signature,
      },
      body: dokuBodyString,
      signal: AbortSignal.timeout(30_000),
      cache: 'no-store',
    })

    const result = (await response.json().catch(() => null)) as
      | {
          virtualAccountData?: { virtualAccountNo?: string; virtualAccountName?: string }
          virtualAccountNo?: string
          message?: string
        }
      | null

    const virtualAccountNumber =
      result?.virtualAccountData?.virtualAccountNo || result?.virtualAccountNo

    if (!response.ok || !virtualAccountNumber) {
      console.error('[DOKU] VA creation failed:', response.status, result)
      return NextResponse.json(
        { success: false, message: result?.message || 'Gagal membuat Virtual Account DOKU' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Virtual Account berhasil dibuat',
      data: {
        orderId,
        virtualAccountNumber,
        amount,
        paymentMethod,
        buyerName,
        phone,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error('[DOKU] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Payment error: ' + (error instanceof Error ? error.message : 'Unknown'),
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId')
  if (!orderId) {
    return NextResponse.json(
      { success: false, message: 'orderId is required' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      orderId,
      status: 'PENDING',
      message: 'Payment status check',
    },
  })
}
