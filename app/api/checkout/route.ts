import { NextRequest, NextResponse } from 'next/server'

// DOKU Configuration - Get from environment variables
const DOKU_BASE_URL = process.env.DOKU_BASE_URL || 'https://api-sandbox.doku.com'
const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID || 'doku_key_075218a89eae4e8e82368a68f645d472'
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY || 'SK-nQyTX37AFzKb6QuqOGsA'
const DOKU_PUBLIC_KEY = process.env.DOKU_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7Kbr1bRy6j/GluxwY2asI4KLZL2s77jmwUMlRRZpLQUYZ/ZIyuc0bDP+aAb5GYLwdEeWQLZ0ITGNR7ocB+/EfomttCaL0lazdSbDNAXKDfnY3TIJnSMOQYtTin9uINz5n5fWEvNbWfsZwMQKsWWXol25dyIlbM1iRRrLyKgxDnH1WJzVz4jOveZWNPPaGgDBAkx1e+bgM7wlzMkvFeQCn21Jo9XIEmiBkmxdG6v7xybghnE4Jy1ne3WVeNqHVx2RWQtqsbpskPWNoiA5cpUIPETuVVFCKDn143zR7vqdTjsfZo9JKSH41bjVz5dVYzwh6OrOGLENPe4UzKcoIPtocQIDAQAB
-----END PUBLIC KEY-----`

// Generate signature for DOKU payment
function generateSignature(payload: string, secretKey: string): string {
  // For sandbox environment, we can use a simple approach
  // In production, use proper HMAC-SHA256
  const crypto = require('crypto')
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('base64')
  return signature
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

    // Prepare payment data for DOKU
    const paymentData = {
      order: {
        order_id: orderId,
        amount: amount.toString(),
        currency: 'IDR',
        locale: 'en',
        callback_url: callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/callback`,
      },
      customer: {
        name: buyerName,
        phone: buyerPhone,
      },
      payment: {
        payment_method: 'DOKU',
        payment_channel: ['QRIS', 'VIRTUAL_ACCOUNT'],
      },
      billing_address: {
        name: buyerName,
        phone: buyerPhone,
      },
    }

    // For demo/sandbox - simulate payment link
    // In production, integrate with DOKU API directly
    const paymentLink = `${DOKU_BASE_URL}/checkout/${orderId}`

    // Simulate DOKU response for demo purposes
    // In production, this would call actual DOKU API
    const response = {
      success: true,
      message: 'Payment link created',
      data: {
        orderId,
        paymentLink,
        amount,
        buyerName,
        buyerPhone,
        productName,
        uniqueCode,
        status: 'pending',
        createdAt: new Date().toISOString(),
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

// Handle DOKU callback/webhook
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Process DOKU payment callback
    const { 
      orderId, 
      status, 
      transactionId,
      amount,
      buyerName 
    } = body

    console.log('[DOKU Callback] Payment status update:', {
      orderId,
      status,
      transactionId,
      amount,
    })

    // Update buyer payment status in database
    // This would integrate with your existing buyer API
    
    return NextResponse.json({
      success: true,
      message: 'Callback received',
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