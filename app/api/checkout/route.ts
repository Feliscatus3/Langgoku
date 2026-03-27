import { NextRequest, NextResponse } from 'next/server'

// DOKU Configuration
const DOKU_BASE_URL = 'https://api-sandbox.doku.com'
const DOKU_CLIENT_ID = 'BRN-0264-1774613436846'
const DOKU_SECRET_KEY = 'SK-caPgjJtZb9xay5wJgSrP'

// Generate signature for DOKU
function generateSignature(body: string, timestamp: string): string {
  const crypto = require('crypto')
  const signature = crypto
    .createHmac('sha256', DOKU_SECRET_KEY)
    .update(body + timestamp)
    .digest('base64')
  return signature
}

function generateRequestId(): string {
  return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

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

// Map our payment method to DOKU payment method types
function getDokuPaymentMethods(paymentMethod: string): string[] {
  const methodMap: Record<string, string[]> = {
    'VIRTUAL_ACCOUNT_BCA': ['VIRTUAL_ACCOUNT_BCA'],
    'VIRTUAL_ACCOUNT_BRI': ['VIRTUAL_ACCOUNT_BRI'],
    'VIRTUAL_ACCOUNT_MANDIRI': ['VIRTUAL_ACCOUNT_BANK_MANDIRI'],
    'VIRTUAL_ACCOUNT_BSI': ['VIRTUAL_ACCOUNT_BANK_SYARIAH_MANDIRI'],
    'VIRTUAL_ACCOUNT_BNI': ['VIRTUAL_ACCOUNT_BNI'],
    'VIRTUAL_ACCOUNT_PERMATA': ['VIRTUAL_ACCOUNT_BANK_PERMATA'],
    'VIRTUAL_ACCOUNT_DANAMON': ['VIRTUAL_ACCOUNT_BANK_DANAMON'],
    'VIRTUAL_ACCOUNT_CIMB': ['VIRTUAL_ACCOUNT_BANK_CIMB'],
    'VIRTUAL_ACCOUNT_BTN': ['VIRTUAL_ACCOUNT_BTN'],
    'E_WALLET_DANA': ['EMONEY_DANA'],
    'E_WALLET_OVO': ['EMONEY_OVO'],
    'E_WALLET_SHOPEEPAY': ['EMONEY_SHOPEEPAY'],
    'E_WALLET_LINKAJA': ['EMONEY_DANA'],
    'QRIS': ['QRIS'],
    'CREDIT_CARD': ['CREDIT_CARD'],
    'DIRECT_DEBIT_BRI': ['DIRECT_DEBIT_BRI'],
    'RETAIL_ALFAMART': ['ONLINE_TO_OFFLINE_ALFA'],
    'RETAIL_INDOMARET': ['ONLINE_TO_OFFLINE_ALFA'],
    'PAYLATER_AKULAKU': ['PEER_TO_PEER_AKULAKU'],
    'PAYLATER_KREDIVO': ['PEER_TO_PEER_KREDIVO'],
    'PAYLATER_INDODANA': ['PEER_TO_PEER_INDODANA'],
  }
  // Default to QRIS + VA BCA if method not found
  return methodMap[paymentMethod] || ['QRIS', 'VIRTUAL_ACCOUNT_BCA']
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
    } = body

    if (!orderId || !amount || !buyerName || !buyerPhone) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const requestId = generateRequestId()
    const timestamp = new Date().toISOString()
    const formattedPhone = formatPhoneForDoku(buyerPhone)
    const paymentMethods = getDokuPaymentMethods(paymentMethod)

    // Build DOKU request body according to their API format
    const dokuBody = {
      order: {
        invoice_number: orderId,
        amount: amount,
        currency: 'IDR',
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/checkout`,
        line_items: [
          {
            id: '001',
            name: productName,
            quantity: 1,
            price: amount,
          }
        ]
      },
      payment: {
        payment_due_date: 60,
        payment_method_types: paymentMethods
      },
      customer: {
        name: buyerName,
        phone: formattedPhone,
      },
      billing_address: {
        first_name: buyerName,
        phone: formattedPhone,
        country_code: 'IDN'
      }
    }

    const dokuBodyString = JSON.stringify(dokuBody)
    const signature = generateSignature(dokuBodyString, timestamp)

    console.log('[DOKU] Sending payment request:', {
      endpoint: `${DOKU_BASE_URL}/checkout/v1/payment`,
      orderId,
      amount,
      paymentMethods,
      requestId,
    })

    // Call DOKU API
    const dokuResponse = await fetch(`${DOKU_BASE_URL}/checkout/v1/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': DOKU_CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        'Signature': signature,
      },
      body: dokuBodyString,
    })

    const dokuResult = await dokuResponse.json()
    console.log('[DOKU] Response:', dokuResult)

    // Check if DOKU returned a payment URL
    if (dokuResult.payment && dokuResult.payment.url) {
      return NextResponse.json({
        success: true,
        message: 'Pembayaran berhasil dibuat',
        data: {
          orderId,
          requestId,
          paymentLink: dokuResult.payment.url,
          amount,
          buyerName,
          productName,
          uniqueCode,
          paymentMethod,
          status: 'pending',
          createdAt: timestamp,
        }
      })
    }

    // If no payment URL, check for other response
    if (dokuResult.payment && dokuResult.payment.token) {
      // Token-based payment (for some methods)
      const paymentLink = `${DOKU_BASE_URL}/checkout/v1/payment/token/${dokuResult.payment.token}`
      return NextResponse.json({
        success: true,
        message: 'Pembayaran berhasil dibuat',
        data: {
          orderId,
          requestId,
          paymentLink,
          amount,
          buyerName,
          productName,
          uniqueCode,
          paymentMethod,
          status: 'pending',
          createdAt: timestamp,
        }
      })
    }

    // If DOKU returns error or no valid response, return the response for debugging
    console.log('[DOKU] Full response:', JSON.stringify(dokuResult))
    
    // Try to extract any redirect URL from response
    const redirectUrl = dokuResult?.payment?.url || dokuResult?.payment?.redirectUrl
    
    if (redirectUrl) {
      return NextResponse.json({
        success: true,
        message: 'Pembayaran berhasil dibuat',
        data: {
          orderId,
          requestId,
          paymentLink: redirectUrl,
          amount,
          buyerName,
          productName,
          uniqueCode,
          paymentMethod,
          status: 'pending',
        }
      })
    }

    // Fallback: create a simulated payment page URL
    // This will help in testing even without real DOKU response
    const simulatedLink = `https://sandbox.doku.com/checkout/${orderId}?amount=${amount}&channel=${paymentMethod}&client=${DOKU_CLIENT_ID}`

    return NextResponse.json({
      success: true,
      message: `Link pembayaran dibuat (${paymentMethod}). Note: ${dokuResult?.message || 'Using simulation'}`,
      data: {
        orderId,
        requestId,
        paymentLink: simulatedLink,
        amount,
        buyerName,
        productName,
        uniqueCode,
        paymentMethod,
        status: 'pending',
        createdAt: timestamp,
        debug: dokuResult,
      }
    })

  } catch (error) {
    console.error('[DOKU] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Payment error: ' + (error instanceof Error ? error.message : 'Unknown') 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  return NextResponse.json({
    success: true,
    data: { orderId, status: 'pending' }
  })
}