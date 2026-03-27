import { NextRequest, NextResponse } from 'next/server'

// DOKU Sandbox Configuration
const DOKU_BASE_URL = 'https://api-sandbox.doku.com'
const DOKU_CLIENT_ID = 'BRN-0264-1774613436846'
const DOKU_SECRET_KEY = 'SK-caPgjJtZb9xay5wJgSrP'
const DOKU_API_KEY = 'doku_key_sandbox_72315ee241e849c3a721649e8fa79a36'

// Generate signature for DOKU payment
function generateSignature(payload: string): string {
  const crypto = require('crypto')
  const signature = crypto
    .createHmac('sha256', DOKU_SECRET_KEY)
    .update(payload)
    .digest('base64')
  return signature
}

// Generate request ID for DOKU
function generateRequestId(): string {
  return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Format phone number for DOKU (remove + and leading 0)
function formatPhoneForDoku(phone: string): string {
  let formatted = phone.replace(/\D/g, '') // Remove all non-digits
  if (formatted.startsWith('0')) {
    formatted = formatted.substring(1) // Remove leading 0
  }
  if (!formatted.startsWith('62')) {
    formatted = '62' + formatted // Add Indonesia country code
  }
  return formatted
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      orderId, 
      amount, 
      buyerName, 
      buyerPhone, 
      productName,
      uniqueCode,
      callbackUrl 
    } = body

    // Validate required fields
    if (!orderId || !amount || !buyerName || !buyerPhone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: orderId, amount, buyerName, buyerPhone',
        },
        { status: 400 }
      )
    }

    const requestId = generateRequestId()
    const timestamp = new Date().toISOString()
    const formattedPhone = formatPhoneForDoku(buyerPhone)

    // Prepare DOKU payment request
    // Based on DOKU sandbox API documentation
    const paymentData = {
      client_id: DOKU_CLIENT_ID,
      request_id: requestId,
      order: {
        order_id: orderId,
        order_description: productName,
        amount: amount,
        currency: 'IDR',
        callback_url: callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/checkout`,
      },
      customer: {
        name: buyerName,
        phone: formattedPhone,
        email: '',
      },
      payment: {
        payment_method: 'DOKU',
        payment_channel: ['QRIS', 'VIRTUAL_ACCOUNT_BANK_TRANSFER'],
      },
    }

    // Generate signature
    const signature = generateSignature(JSON.stringify(paymentData))

    console.log('[DOKU Sandbox] Creating payment:', {
      orderId,
      amount,
      buyerName,
      formattedPhone,
      requestId,
      timestamp,
    })

    // In sandbox mode, we simulate the payment link
    // For actual DOKU integration, uncomment below:
    /*
    const dokuResponse = await fetch(`${DOKU_BASE_URL}/checkout/v2/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': DOKU_CLIENT_ID,
        'Request-Id': requestId,
        'Signature': signature,
        'Api-Key': DOKU_API_KEY,
      },
      body: JSON.stringify(paymentData),
    })
    
    const dokuResult = await dokuResponse.json()
    */

    // For sandbox demo - generate simulated payment link
    // This will be replaced with actual DOKU URL in production
    const paymentLink = `${DOKU_BASE_URL}/checkout/v2/payment?client_id=${DOKU_CLIENT_ID}&request_id=${requestId}&order_id=${orderId}&amount=${amount}&signature=${signature.substring(0, 20)}`

    const response = {
      success: true,
      message: 'Payment link created (Sandbox Mode)',
      data: {
        orderId,
        requestId,
        paymentLink,
        amount,
        buyerName,
        buyerPhone: formattedPhone,
        productName,
        uniqueCode,
        status: 'pending',
        createdAt: timestamp,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        sandbox: true,
        instructions: [
          '1. Buka link pembayaran DOKU',
          '2. Pilih metode pembayaran (QRIS/VA)',
          '3. Selesaikan pembayaran',
          '4. Simpan bukti transaksi',
          '5. Klik Konfirmasi Pembayaran',
        ],
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating DOKU payment:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create payment: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}

// Handle DOKU callback/webhook for payment status updates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      orderId, 
      status, 
      transactionId,
      amount,
      buyerName,
      paymentChannel,
      paymentMethod,
    } = body

    console.log('[DOKU Callback] Payment status update:', {
      orderId,
      status,
      transactionId,
      amount,
      paymentChannel,
      paymentMethod,
      timestamp: new Date().toISOString(),
    })

    // Map DOKU status to our system status
    const statusMap: Record<string, string> = {
      'PAID': 'paid',
      'EXPIRED': 'expired',
      'FAILED': 'failed',
      'PENDING': 'pending',
    }

    const mappedStatus = statusMap[status?.toUpperCase()] || 'pending'

    return NextResponse.json({
      success: true,
      message: 'Callback received',
      data: {
        orderId,
        status: mappedStatus,
        transactionId,
      }
    })
  } catch (error) {
    console.error('Error processing DOKU callback:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process callback',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check payment status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json(
      {
        success: false,
        message: 'orderId is required',
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      orderId,
      status: 'pending',
      sandbox: true,
      message: 'Payment status check - Sandbox Mode',
    }
  })
}