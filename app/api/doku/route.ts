import { NextRequest, NextResponse } from 'next/server'
import doku from 'doku-nodejs-library'

// DOKU Configuration from environment
const CLIENT_ID = process.env.DOKU_CLIENT_ID || 'BRN-0264-1774613436846'
const SECRET_KEY = process.env.DOKU_SECRET_KEY || 'SK-caPgjJtZb9xay5wJgSrP'
const IS_PRODUCTION = process.env.DOKU_IS_PRODUCTION === 'true'

// For sandbox, we need to set up with the provided credentials
// Note: SDK requires private/public key generation for production
let snap: any = null

// Initialize DOKU Snap (for production with proper keys)
// For sandbox, we'll use a simplified approach
const initializeDoku = () => {
  try {
    // Try to initialize if we have the required keys
    if (process.env.DOKU_PRIVATE_KEY && process.env.DOKU_PUBLIC_KEY && process.env.DOKU_ISSUER) {
      snap = new doku.Snap({
        isProduction: IS_PRODUCTION,
        privateKey: process.env.DOKU_PRIVATE_KEY,
        clientID: CLIENT_ID,
        publicKey: process.env.DOKU_PUBLIC_KEY,
        dokuPublicKey: process.env.DOKU_PUBLIC_KEY,
        issuer: process.env.DOKU_ISSUER,
        secretKey: SECRET_KEY
      })
    }
  } catch (error) {
    console.log('[DOKU] SDK not initialized:', error)
  }
}

initializeDoku()

// Channel mapping for DOKU
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

    // If SDK is initialized, try to use it
    if (snap) {
      try {
        const CreateVARequestDto = require('doku-nodejs-library/_models/createVaRequestDto')
        const VirtualAccountConfig = require('doku-nodejs-library/_models/virtualAccountConfig')
        const TotalAmount = require('doku-nodejs-library/_models/totalAmount')
        const AdditionalInfo = require('doku-nodejs-library/_models/additionalInfo')

        const createVaRequestDto = new CreateVARequestDto()
        // Use DOKU's partner service ID (get from DOKU dashboard)
        createVaRequestDto.partnerServiceId = process.env.DOKU_PARTNER_SERVICE_ID || 'YOUR_SERVICE_ID'
        createVaRequestDto.customerNo = phone
        createVaRequestDto.virtualAccountNo = createVaRequestDto.partnerServiceId + phone
        createVaRequestDto.virtualAccountName = buyerName
        createVaRequestDto.trxId = orderId

        const totalAmount = new TotalAmount()
        totalAmount.value = amount.toString()
        totalAmount.currency = 'IDR'
        createVaRequestDto.totalAmount = totalAmount

        const virtualAccountConfig = new VirtualAccountConfig()
        virtualAccountConfig.reusableStatus = false

        const additionalInfo = new AdditionalInfo(
          CHANNEL_MAP[paymentMethod] || 'VIRTUAL_ACCOUNT_BANK_CIMB',
          virtualAccountConfig
        )
        createVaRequestDto.additionalInfo = additionalInfo
        createVaRequestDto.virtualAccountTrxType = 'C' // Closed

        const result = await snap.createVa(createVaRequestDto)
        
        return NextResponse.json({
          success: true,
          message: 'Virtual Account created',
          data: {
            orderId,
            virtualAccountNumber: result?.virtualAccountData?.virtualAccountNo,
            amount: amount,
            paymentMethod: paymentMethod,
            buyerName: buyerName,
          }
        })
      } catch (sdkError) {
        console.log('[DOKU] SDK Error:', sdkError)
      }
    }

    // Fallback: Generate mock VA for demo (since sandbox doesn't have full keys)
    // In production, this would use real DOKU API
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