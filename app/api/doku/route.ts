import { NextRequest, NextResponse } from 'next/server'

// DOKU Configuration from environment
const CLIENT_ID = process.env.DOKU_CLIENT_ID || 'BRN-0264-1774613436846'
const SECRET_KEY = process.env.DOKU_SECRET_KEY || 'SK-caPgjJtZb9xay5wJgSrP'
const IS_PRODUCTION = process.env.DOKU_IS_PRODUCTION === 'true'

// Channel mapping for DOKU payment methods
const CHANNEL_MAP: Record<string, string> = {
  'VIRTUAL_ACCOUNT_BCA': 'VIRTUAL_ACCOUNT_BANK_CIMB',
  'VIRTUAL_ACCOUNT_BRI': 'VIRTUAL_ACCOUNT_BANK_CIMB',
  'VIRTUAL_ACCOUNT_MANDIRI': 'VIRTUAL_ACCOUNT_BANK_CIMB',
  'VIRTUAL_ACCOUNT_BNI': 'VIRTUAL_ACCOUNT_BANK_CIMB',
  'QRIS': 'QRIS',
  'E_WALLET_DANA': 'EMONEY_DANA_SNAP',
  'E_WALLET_OVO': 'EMONEY_OVO_SNAP',
  'E_WALLET_SHOPEEPAY': 'EMONEY_SHOPEE_PAY_SNAP',
}

// Generate HMAC signature for DOKU
function generateSignature(payload: string): string {
  const crypto = require('crypto')
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('base64')
}

// Create Virtual Account via DOKU
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderId,
      amount,
      buyerName,
      buyerPhone,
      productName,
      paymentMethod,
    } = body

    if (!orderId || !amount || !buyerName || !buyerPhone) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Format phone number
    const formattedPhone = buyerPhone.replace(/\D/g, '')
    const phone = formattedPhone.startsWith('62') ? formattedPhone : '62' + formattedPhone.substring(1)

    console.log('[DOKU] Creating VA:', { orderId, amount, paymentMethod, buyerName, phone })

    // Prepare DOKU API request
    const dokuRequestBody = {
      partnerServiceId: process.env.DOKU_PARTNER_SERVICE_ID || 'LANGGOKU_TEST',
      customerNo: phone,
      virtualAccountNo: (process.env.DOKU_PARTNER_SERVICE_ID || 'LANGGOKU_TEST') + phone,
      virtualAccountName: buyerName,
      trxId: orderId,
      totalAmount: {
        value: amount.toString(),
        currency: 'IDR'
      },
      additionalInfo: {
        channel: CHANNEL_MAP[paymentMethod] || 'VIRTUAL_ACCOUNT_BANK_CIMB'
      },
      virtualAccountTrxType: 'C'
    }

    const dokuBodyString = JSON.stringify(dokuRequestBody)
    const timestamp = new Date().toISOString()
    const signature = generateSignature(dokuBodyString + timestamp)

    // DOKU API endpoint
    const dokuBaseUrl = IS_PRODUCTION 
      ? 'https://api.doku.com' 
      : 'https://api-sandbox.doku.com'

    try {
      // Try to call DOKU API directly
      const dokuResponse = await fetch(`${dokuBaseUrl}/checkout/v1/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': CLIENT_ID,
          'Request-Id': `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          'Request-Timestamp': timestamp,
          'Signature': signature,
        },
        body: dokuBodyString,
      })

      const dokuResult = await dokuResponse.json()
      console.log('[DOKU] API Response:', dokuResult)

      // If successful, return the payment URL
      if (dokuResult.payment?.url) {
        return NextResponse.json({
          success: true,
          message: 'Virtual Account created',
          data: {
            orderId,
            paymentUrl: dokuResult.payment.url,
            amount: amount,
            paymentMethod: paymentMethod,
            buyerName: buyerName,
          }
        })
      }
    } catch (apiError) {
      console.log('[DOKU] API call failed, using mock:', apiError)
    }

    // Fallback: Generate mock VA number for demo
    // In production with proper keys, this would use real DOKU API
    const mockVANumber = generateMockVANumber(paymentMethod)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    return NextResponse.json({
      success: true,
      message: 'Virtual Account (Demo Mode)',
      data: {
        orderId,
        virtualAccountNumber: mockVANumber,
        amount: amount,
        paymentMethod: paymentMethod,
        buyerName: buyerName,
        phone: phone,
        expiresAt: expiresAt,
        note: 'Demo mode - Configure DOKU keys for production'
      }
    })

  } catch (error) {
    console.error('[DOKU] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Payment error: ' + (error instanceof Error ? error.message : 'Unknown') },
      { status: 500 }
    )
  }
}

// Generate mock VA number for demo
function generateMockVANumber(paymentMethod: string): string {
  const bankCodes: Record<string, string> = {
    'VIRTUAL_ACCOUNT_BCA': '88810',
    'VIRTUAL_ACCOUNT_BRI': '88811',
    'VIRTUAL_ACCOUNT_MANDIRI': '88812',
    'VIRTUAL_ACCOUNT_BNI': '88813',
    'E_WALLET_DANA': '89001',
    'E_WALLET_OVO': '89002',
    'QRIS': 'QRIS',
  }
  
  const code = bankCodes[paymentMethod] || '88810'
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')
  return code + random
}

// Check payment status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: 'orderId is required' },
      { status: 400 }
    )
  }

  // In production, check status with DOKU API
  // For demo, return pending
  return NextResponse.json({
    success: true,
    data: {
      orderId,
      status: 'PENDING',
      message: 'Payment status check'
    }
  })
}