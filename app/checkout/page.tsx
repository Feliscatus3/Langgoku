'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/googleSheets'

interface CheckoutData {
  productId: string
  productName: string
  productDuration: string
  originalPrice: number
  uniqueCode: string
  finalPrice: number
  buyerName: string
  buyerPhone: string
}

interface PaymentResult {
  success: boolean
  data?: {
    orderId: string
    virtualAccountNumber: string
    amount: number
    paymentMethod: string
    buyerName: string
    phone: string
    expiresAt: string
  }
  message?: string
}

const PAYMENT_METHODS = [
  { id: 'VIRTUAL_ACCOUNT_BCA', name: 'Bank BCA', icon: '🏦' },
  { id: 'VIRTUAL_ACCOUNT_BRI', name: 'Bank BRI', icon: '🏦' },
  { id: 'VIRTUAL_ACCOUNT_MANDIRI', name: 'Bank Mandiri', icon: '🏦' },
  { id: 'VIRTUAL_ACCOUNT_BNI', name: 'Bank BNI', icon: '🏦' },
  { id: 'QRIS', name: 'QRIS', icon: '📱' },
  { id: 'E_WALLET_DANA', name: 'DANA', icon: '💰' },
  { id: 'E_WALLET_OVO', name: 'OVO', icon: '💰' },
  { id: 'RETAIL_ALFAMART', name: 'Alfamart', icon: '🏪' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [creatingPayment, setCreatingPayment] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem('checkoutData')
    if (!data) {
      router.push('/')
      return
    }
    setCheckoutData(JSON.parse(data))
    setLoading(false)
  }, [router])

  const handleSelectMethod = async (methodId: string) => {
    if (!checkoutData) return
    
    setSelectedMethod(methodId)
    setCreatingPayment(true)
    
    try {
      // Call DOKU API to create Virtual Account
      const orderId = `LANGGOKU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const response = await fetch('/api/doku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: checkoutData.finalPrice,
          buyerName: checkoutData.buyerName,
          buyerPhone: checkoutData.buyerPhone,
          productName: checkoutData.productName,
          paymentMethod: methodId,
        })
      })
      
      const result = await response.json()
      console.log('[Checkout] DOKU Result:', result)
      
      setPaymentResult(result)
      setShowPaymentPopup(true)
    } catch (error) {
      console.error('[Checkout] Error creating payment:', error)
      setPaymentResult({
        success: false,
        message: 'Gagal membuat pembayaran'
      })
      setShowPaymentPopup(true)
    } finally {
      setCreatingPayment(false)
    }
  }

  const handleClosePopup = () => {
    setShowPaymentPopup(false)
  }

  const handleCopyCode = () => {
    if (checkoutData?.uniqueCode) {
      navigator.clipboard.writeText(checkoutData.uniqueCode)
    }
  }

  const handleCopyVANumber = () => {
    if (paymentResult?.data?.virtualAccountNumber) {
      navigator.clipboard.writeText(paymentResult.data.virtualAccountNumber)
    }
  }

  const handleWhatsAppConfirmation = () => {
    if (!checkoutData) return

    const methodName = PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name || 'DOKU'
    const vaNumber = paymentResult?.data?.virtualAccountNumber || '-'
    
    const message = `Halo Admin Langgoku, saya ingin membeli:

📦 Produk: ${checkoutData.productName}
👤 Nama: ${checkoutData.buyerName}
📱 WhatsApp: ${checkoutData.buyerPhone}
💵 Total: ${formatPrice(checkoutData.finalPrice)}
💰 Kode: ${checkoutData.uniqueCode}
🏧 Metode: ${methodName}
🏦 VA Number: ${vaNumber}

Mohon info selanjutnya!`
    
    window.open(`https://wa.me/${checkoutData.buyerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (loading || !checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-purple-200">Pembayaran via DOKU Payment Gateway</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Produk</p>
                  <p className="text-xl font-bold">{checkoutData.productName}</p>
                  <p className="text-gray-600">{checkoutData.productDuration}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Nama</p>
                    <p className="font-semibold">{checkoutData.buyerName}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">WhatsApp</p>
                    <p className="font-semibold">{checkoutData.buyerPhone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200">
                  <p className="text-sm font-semibold text-amber-800">Kode Pembayaran</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-3xl font-bold text-amber-700">{checkoutData.uniqueCode}</span>
                    <button onClick={handleCopyCode} className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm">
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Total Bayar</p>
                  <p className="text-3xl font-bold text-purple-600">{formatPrice(checkoutData.finalPrice)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Pilih Metode Pembayaran</h2>
            <p className="text-gray-600 text-sm mb-6">Pilih metode pembayaran DOKU</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelectMethod(method.id)}
                  disabled={creatingPayment}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-center disabled:opacity-50"
                >
                  <span className="text-3xl block mb-2">{method.icon}</span>
                  <span className="font-medium text-sm">{method.name}</span>
                </button>
              ))}
            </div>
            
            {creatingPayment && (
              <div className="mt-4 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-2">Membuat Virtual Account...</p>
              </div>
            )}
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppConfirmation}
            className="w-full mt-6 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
          >
            Hubungi Admin via WhatsApp
          </button>

          <Link href="/" className="block text-center text-gray-600 hover:text-gray-900 mt-4">
            ← Kembali ke Toko
          </Link>
        </div>
      </div>

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-xl font-bold">Pembayaran {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}</h3>
              <p className="text-gray-600 text-sm">Total: {formatPrice(checkoutData.finalPrice)}</p>
            </div>

            {paymentResult?.success && paymentResult.data ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-green-700 font-medium text-center">✓ Virtual Account Dibuat!</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Nomor Virtual Account:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-purple-700 font-mono">
                      {paymentResult.data.virtualAccountNumber}
                    </span>
                    <button onClick={handleCopyVANumber} className="px-2 py-1 bg-purple-500 text-white rounded text-sm">
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl mb-4">
                  <p className="text-sm text-amber-800">
                    <strong>Total Transfer: </strong>
                    {formatPrice(checkoutData.finalPrice)}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    (Sudah termasuk kode pembayaran {checkoutData.uniqueCode})
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Cara Pembayaran:</strong><br/>
                    1. Transfer ke nomor VA di atas<br/>
                    2. Gunakan nominal yang sesuai<br/>
                    3. Simpan bukti transfer<br/>
                    4. Konfirmasi via WhatsApp
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-red-700">{paymentResult?.message || 'Gagal membuat pembayaran'}</p>
              </div>
            )}

            <button
              onClick={handleWhatsAppConfirmation}
              className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all mb-3"
            >
              Konfirmasi via WhatsApp
            </button>

            <button
              onClick={handleClosePopup}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}