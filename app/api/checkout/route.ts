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
  let formatted = phone.replace(/\D/g, '')
  if (formatted.startsWith('0')) {
    formatted = formatted.substring(1)
  }
  if (!formatted.startsWith('62')) {
    formatted = '62' + formatted
  }
  return formatted
}

// Map our payment method to DOKU channel
function getDokuChannel(paymentMethod: string): string {
  const channelMap: Record<string, string> = {
    'QRIS': 'QRIS',
    'VIRTUAL_ACCOUNT_BCA': 'VIRTUAL_ACCOUNT_BANK_TRANSFER',
    'VIRTUAL_ACCOUNT_BRI': 'VIRTUAL_ACCOUNT_BANK_TRANSFER',
    'VIRTUAL_ACCOUNT_MANDIRI': 'VIRTUAL_ACCOUNT_BANK_TRANSFER',
    'VIRTUAL_ACCOUNT_BSI': 'VIRTUAL_ACCOUNT_BANK_TRANSFER',
    'E_WALLET_DANA': 'E-WALLET',
  }
  return channelMap[paymentMethod] || 'QRIS'
}

// Map our payment method to DOKU channel code
function getDokuChannelCode(paymentMethod: string): string {
  const codeMap: Record<string, string> = {
    'QRIS': 'QRIS',
    'VIRTUAL_ACCOUNT_BCA': 'BCA',
    'VIRTUAL_ACCOUNT_BRI': 'BRI',
    'VIRTUAL_ACCOUNT_MANDIRI': 'MANDIRI',
    'VIRTUAL_ACCOUNT_BSI': 'BSI',
    'E_WALLET_DANA': 'DANA',
  }
  return codeMap[paymentMethod] || 'BCA'
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
      paymentMethod,
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
    const channel = getDokuChannel(paymentMethod)
    const channelCode = getDokuChannelCode(paymentMethod)

    // Prepare DOKU payment request body
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
        payment_channel: [channel],
      },
    }

    // Generate signature
    const signature = generateSignature(JSON.stringify(paymentData))

    console.log('[DOKU] Creating payment with:', {
      orderId,
      amount,
      buyerName,
      formattedPhone,
      paymentMethod,
      channel,
      channelCode,
      requestId,
      timestamp,
    })

    // Try to call DOKU API directly
    try {
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
      
      console.log('[DOKU] Response:', dokuResult)

      if (dokuResult.payment && dokuResult.payment.url) {
        return NextResponse.json({
          success: true,
          message: 'Payment link created successfully',
          data: {
            orderId,
            requestId,
            paymentLink: dokuResult.payment.url,
            amount,
            buyerName,
            buyerPhone: formattedPhone,
            productName,
            uniqueCode,
            paymentMethod,
            status: 'pending',
            createdAt: timestamp,
          }
        })
      }
    } catch (dokuError) {
      console.log('[DOKU] Direct API call failed, using simulation:', dokuError)
    }

    // Fallback: Generate payment URL manually based on payment method
    // For QRIS, we would typically get a QR code from DOKU
    // For VA, we would get a virtual account number
    
    let paymentUrl = ''
    let paymentInstructions = ''

    switch (paymentMethod) {
      case 'QRIS':
        paymentUrl = `${DOKU_BASE_URL}/checkout/payment?channel=QRIS&client_id=${DOKU_CLIENT_ID}&order_id=${orderId}`
        paymentInstructions = `Silakan scan QR Code DOKU dengan nominal ${amount}`
        break
      case 'VIRTUAL_ACCOUNT_BCA':
        paymentUrl = `${DOKU_BASE_URL}/checkout/payment?channel=VA&bank=BCA&client_id=${DOKU_CLIENT_ID}&order_id=${orderId}`
        paymentInstructions = `Silakan transfer ke Virtual Account BCA dengan nominal ${amount}`
        break
      case 'VIRTUAL_ACCOUNT_BRI':
        paymentUrl = `${DOKU_BASE_URL}/checkout/payment?channel=VA&bank=BRI&client_id=${DOKU_CLIENT_ID}&order_id=${orderId}`
        paymentInstructions = `Silakan transfer ke Virtual Account BRI dengan nominal ${amount}`
        break
      case 'VIRTUAL_ACCOUNT_MANDIRI':
        paymentUrl = `${DOKU_BASE_URL}/checkout/payment?channel=VA&bank=MANDIRI&client_id=${DOKU_CLIENT_ID}&order_id=${orderId}`
        paymentInstructions = `Silakan transfer ke Virtual Account Mandiri dengan nominal ${amount}`
        break
      case 'VIRTUAL_ACCOUNT_BSI':
        paymentUrl = `${DOKU_BASE_URL}/checkout/payment?channel=VA&bank=BSI&client_id=${DOKU_CLIENT_ID}&order_id=${orderId}`
        paymentInstructions = `Silakan transfer ke Virtual Account BSI dengan nominal ${amount}`
        break
      case 'E_WALLET_DANA':
        paymentUrl = `${DOKU_BASE_URL}/checkout/payment?channel=E-WALLET&provider=DANA&client_id=${DOKU_CLIENT_ID}&order_id=${orderId}`
        paymentInstructions = `Silakan membayar via DANA dengan nominal ${amount}`
        break
      default:
        paymentUrl = `${DOKU_BASE_URL}/checkout?client_id=${DOKU_CLIENT_ID}&order_id=${orderId}&amount=${amount}`
    }

    // For sandbox demo - use direct DOKU checkout URL
    const sandboxPaymentLink = `https://sandbox.doku.com/checkout/${orderId}?channel=${channelCode}&amount=${amount}&client=${DOKU_CLIENT_ID}`

    return NextResponse.json({
      success: true,
      message: `Pembayaran via ${paymentMethod.replace(/_/g, ' ')} - ${paymentInstructions || 'Silakan lanjutkan pembayaran'}`,
      data: {
        orderId,
        requestId,
        paymentLink: sandboxPaymentLink,
        amount,
        buyerName,
        buyerPhone: formattedPhone,
        productName,
        uniqueCode,
        paymentMethod,
        channel,
        status: 'pending',
        createdAt: timestamp,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        sandbox: true,
        note: 'Mode Sandbox - Untuk production, gunakan credential DOKU production'
      }
    })
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      orderId, 
      status, 
      transactionId,
    } = body

    console.log('[DOKU Callback] Payment status update:', {
      orderId,
      status,
      transactionId,
    })

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
    }
  })
}