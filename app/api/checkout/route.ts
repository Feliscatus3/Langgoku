import { NextRequest, NextResponse } from 'next/server'
import {
  DOKU_CHECKOUT_TARGET,
  createCheckoutSignature,
  dokuTimestamp,
  formatPhoneForDoku,
  generateRequestId,
  getDokuBaseUrl,
  getDokuClientId,
  getDokuPaymentMethods,
  isDokuConfigured,
} from '@/lib/doku'

export const dynamic = 'force-dynamic'

function getBaseUrl(request: NextRequest): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin).replace(/\/$/, '')
}

export async function POST(request: NextRequest) {
  try {
    if (!isDokuConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Pembayaran DOKU belum dikonfigurasi. Hubungi admin via WhatsApp.',
        },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => null)
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : ''
    const amount = Math.round(Number(body?.amount))
    const buyerName = typeof body?.buyerName === 'string' ? body.buyerName.trim() : ''
    const buyerPhone = typeof body?.buyerPhone === 'string' ? body.buyerPhone.trim() : ''
    const productName = typeof body?.productName === 'string' ? body.productName.trim() : ''
    const uniqueCode = typeof body?.uniqueCode === 'string' ? body.uniqueCode.trim() : ''
    const paymentMethod = typeof body?.paymentMethod === 'string' ? body.paymentMethod : 'QRIS'

    if (!orderId || !buyerName || !buyerPhone || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid required fields' },
        { status: 400 }
      )
    }

    const requestId = generateRequestId()
    const timestamp = dokuTimestamp()
    const formattedPhone = formatPhoneForDoku(buyerPhone)
    const paymentMethods = getDokuPaymentMethods(paymentMethod)

    const dokuBody = {
      order: {
        invoice_number: orderId,
        amount,
        currency: 'IDR',
        callback_url: `${getBaseUrl(request)}/checkout`,
        line_items: [
          {
            id: '001',
            name: productName || orderId,
            quantity: 1,
            price: amount,
          },
        ],
      },
      payment: {
        payment_due_date: 60,
        payment_method_types: paymentMethods,
      },
      customer: {
        name: buyerName,
        phone: formattedPhone,
      },
      billing_address: {
        first_name: buyerName,
        phone: formattedPhone,
        country_code: 'IDN',
      },
    }

    const dokuBodyString = JSON.stringify(dokuBody)
    const signature = createCheckoutSignature(
      requestId,
      timestamp,
      DOKU_CHECKOUT_TARGET,
      dokuBodyString
    )

    const response = await fetch(`${getDokuBaseUrl()}${DOKU_CHECKOUT_TARGET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': getDokuClientId(),
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        Signature: signature,
      },
      body: dokuBodyString,
      signal: AbortSignal.timeout(30_000),
      cache: 'no-store',
    })

    const result = (await response.json().catch(() => null)) as
      | { payment?: { url?: string }; message?: string }
      | null

    const paymentUrl = result?.payment?.url
    if (!response.ok || !paymentUrl) {
      console.error('[DOKU] Payment creation failed:', response.status, result)
      return NextResponse.json(
        {
          success: false,
          message: result?.message || 'Gagal membuat pembayaran DOKU',
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Pembayaran berhasil dibuat',
      data: {
        orderId,
        requestId,
        paymentLink: paymentUrl,
        amount,
        buyerName,
        productName,
        uniqueCode,
        paymentMethod,
        status: 'pending',
        createdAt: timestamp,
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
      { success: false, message: 'orderId diperlukan' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    data: { orderId, status: 'pending' },
  })
}
