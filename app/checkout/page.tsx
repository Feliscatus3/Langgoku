'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, calculateExpiryDate } from '@/lib/googleSheets'

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

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning'
  onClose: () => void
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  category: string
}

// Full list of DOKU payment methods
const PAYMENT_METHODS: PaymentMethod[] = [
  // Virtual Account - Bank
  { id: 'VIRTUAL_ACCOUNT_BCA', name: 'Bank BCA', icon: '🏦', category: 'Virtual Account' },
  { id: 'VIRTUAL_ACCOUNT_BRI', name: 'Bank BRI', icon: '🏦', category: 'Virtual Account' },
  { id: 'VIRTUAL_ACCOUNT_MANDIRI', name: 'Bank Mandiri', icon: '🏦', category: 'Virtual Account' },
  { id: 'VIRTUAL_ACCOUNT_BSI', name: 'Bank BSI', icon: '🏦', category: 'Virtual Account' },
  { id: 'VIRTUAL_ACCOUNT_BNI', name: 'Bank BNI', icon: '🏦', category: 'Virtual Account' },
  { id: 'VIRTUAL_ACCOUNT_PERMATA', name: 'Bank Permata', icon: '🏦', category: 'Virtual Account' },
  { id: 'VIRTUAL_ACCOUNT_DANAMON', name: 'Bank Danamon', icon: '🏦', category: 'Virtual Account' },
  { id: 'VIRTUAL_ACCOUNT_CIMB', name: 'Bank CIMB', icon: '🏦', category: 'Virtual Account' },
  { id: 'VIRTUAL_ACCOUNT_MAYBANK', name: 'Bank Maybank', icon: '🏦', category: 'Virtual Account' },
  { id: 'VIRTUAL_ACCOUNT_BTN', name: 'Bank BTN', icon: '🏦', category: 'Virtual Account' },
  
  // E-Wallet
  { id: 'E_WALLET_DANA', name: 'DANA', icon: '💰', category: 'E-Wallet' },
  { id: 'E_WALLET_OVO', name: 'OVO', icon: '💰', category: 'E-Wallet' },
  { id: 'E_WALLET_SHOPEEPAY', name: 'ShopeePay', icon: '🛒', category: 'E-Wallet' },
  { id: 'E_WALLET_LINKAJA', name: 'LinkAja', icon: '🔗', category: 'E-Wallet' },
  
  // QRIS
  { id: 'QRIS', name: 'QRIS', icon: '📱', category: 'QRIS' },
  
  // Credit Card
  { id: 'CREDIT_CARD', name: 'Kartu Kredit', icon: '💳', category: 'Kartu Kredit' },
  
  // Direct Debit
  { id: 'DIRECT_DEBIT_BRI', name: 'Direct Debit BRI', icon: '🏦', category: 'Direct Debit' },
  
  // Retail
  { id: 'RETAIL_ALFAMART', name: 'Alfamart', icon: '🏪', category: 'Retail' },
  { id: 'RETAIL_INDOMARET', name: 'Indomaret', icon: '🏪', category: 'Retail' },
  
  // Paylater
  { id: 'PAYLATER_AKULAKU', name: 'Akulaku', icon: '📊', category: 'Paylater' },
  { id: 'PAYLATER_KREDIVO', name: 'Kredivo', icon: '📊', category: 'Paylater' },
  { id: 'PAYLATER_INDODANA', name: 'Indodana', icon: '📊', category: 'Paylater' },
  
  // Others
  { id: 'DIRECT_TRANSFER_BCA', name: 'Direct Transfer BCA', icon: '💸', category: 'Transfer' },
  { id: 'REKBER_BCA', name: 'REKBER BCA', icon: '🤝', category: 'Escrow' },
]

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-amber-500'
  
  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${bgColor} text-white`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">
          {type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠️'}
        </span>
        <p className="font-medium">{message}</p>
        <button onClick={onClose} className="ml-4 text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedToSheet, setSavedToSheet] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = sessionStorage.getItem('checkoutData')
    if (!data) {
      router.push('/')
      return
    }
    const parsedData = JSON.parse(data)
    setCheckoutData(parsedData)
    setLoading(false)
  }, [router])

  const saveBuyerData = async (showLoading = true) => {
    if (savedToSheet || !checkoutData) return
    
    if (showLoading) setSaving(true)
    try {
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = calculateExpiryDate(checkoutData.productDuration).toISOString().split('T')[0]

      const response = await fetch('/api/buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          name: checkoutData.buyerName,
          phone: checkoutData.buyerPhone,
          product: checkoutData.productName,
          duration: checkoutData.productDuration,
          startDate,
          endDate,
          paymentMethod: 'DOKU',
          paymentStatus: 'pending',
          uniqueCode: checkoutData.uniqueCode,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setSavedToSheet(true)
        showToast('Data berhasil disimpan! Silakan pilih metode pembayaran.', 'success')
      }
    } catch (error) {
      console.error('[Checkout] Error saving buyer data:', error)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (checkoutData && !savedToSheet && !saving) {
      saveBuyerData()
    }
  }, [checkoutData])

  const handleCreatePayment = async () => {
    if (!checkoutData) return

    if (!selectedPaymentMethod) {
      showToast('Silakan pilih metode pembayaran terlebih dahulu!', 'warning')
      return
    }

    if (!savedToSheet) {
      await saveBuyerData()
    }

    setProcessingPayment(true)
    
    try {
      const orderId = `LANGGOKU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          orderId,
          amount: checkoutData.finalPrice,
          buyerName: checkoutData.buyerName,
          buyerPhone: checkoutData.buyerPhone,
          productName: checkoutData.productName,
          uniqueCode: checkoutData.uniqueCode,
          paymentMethod: selectedPaymentMethod,
        }),
      })

      const result = await response.json()
      console.log('[Checkout] Payment result:', result)
      
      if (result.success && result.data.paymentLink) {
        setPaymentLink(result.data.paymentLink)
        showToast(result.message || `Pembayaran via ${selectedPaymentMethod} berhasil dibuat!`, 'success')
      } else {
        showToast(result.message || 'Gagal membuat link pembayaran. Silakan coba lagi.', 'error')
      }
    } catch (error) {
      console.error('[Checkout] Error creating payment:', error)
      showToast('Terjadi kesalahan. Silakan coba lagi.', 'error')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!checkoutData) return

    if (!confirm('Apakah Anda SUDAH MEMBAYAR melalui DOKU? Pastikan nominal yang ditransfer sudah benar (termasuk kode unik).')) {
      return
    }

    setPaymentConfirmed(true)
    showToast('Konfirmasi pembayaran diterima! Tim admin akan memverifikasi pembayaran Anda.', 'success')
  }

  const handleCopyCode = () => {
    if (checkoutData?.uniqueCode) {
      navigator.clipboard.writeText(checkoutData.uniqueCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWhatsAppConfirmation = () => {
    if (!checkoutData) return

    const methodName = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name || 'DOKU'
    
    const message = `Halo Admin Langgoku, saya sudah melakukan pembayaran melalui DOKU:

📦 Produk: ${checkoutData.productName}
👤 Nama: ${checkoutData.buyerName}
📱 No. WhatsApp: ${checkoutData.buyerPhone}
💰 Kode Pembayaran: ${checkoutData.uniqueCode}
💵 Total: ${formatPrice(checkoutData.finalPrice)}
🏧 Metode: ${methodName}

Mohon dicek dan diverifikasi. Terima kasih!`
    
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${checkoutData.buyerPhone.replace(/\D/g, '')}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type })
  }

  // Group payment methods by category
  const groupedMethods = PAYMENT_METHODS.reduce((acc, method) => {
    if (!acc[method.category]) acc[method.category] = []
    acc[method.category].push(method)
    return acc
  }, {} as Record<string, PaymentMethod[]>)

  if (loading || !checkoutData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold">Memuat data pembayaran...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black mb-4">Checkout</h1>
            <p className="text-xl text-purple-100">Pembayaran via DOKU Payment Gateway</p>
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-amber-900 text-lg mb-3 flex items-center gap-2">
              ⚠️ Peringatan Penting - Cegah Penipu!
            </h3>
            <ul className="text-amber-800 text-sm space-y-2">
              <li>• <strong>JANGAN</strong> klik "Konfirmasi Pembayaran" jika Anda <strong>BELUM</strong> membayar</li>
              <li>• Pastikan nominal yang ditransfer sudah <strong>BENAR</strong> (termasuk kode unik)</li>
              <li>• Simpan bukti pembayaran sebagai verifikasi</li>
              <li>• Admin akan memverifikasi pembayaran sebelum mengirim akun</li>
            </ul>
          </div>

          {saving && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-blue-700 font-medium">Menyimpan data...</span>
            </div>
          )}
          {savedToSheet && !saving && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-green-700 font-medium">Data pembeli tersimpan - Pilih metode pembayaran dan lakukan pembayaran</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ringkasan Pesanan</h2>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Produk</p>
                    <p className="text-xl font-bold text-gray-900">{checkoutData.productName}</p>
                    <p className="text-gray-600">{checkoutData.productDuration}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">Nama</p>
                      <p className="font-semibold">{checkoutData.buyerName}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">WhatsApp</p>
                      <p className="font-semibold">{checkoutData.buyerPhone}</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200">
                    <p className="text-sm font-semibold text-amber-800 mb-2">Kode Pembayaran</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={checkoutData.uniqueCode}
                        readOnly
                        className="flex-1 bg-white border-2 border-amber-300 rounded-lg px-3 py-2 font-bold text-xl text-center"
                      />
                      <button
                        onClick={handleCopyCode}
                        className="px-3 py-2 bg-amber-500 text-white rounded-lg"
                      >
                        {copied ? '✓' : '📋'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Total Pembayaran</h3>
                <div className="text-3xl font-black text-purple-600">
                  {formatPrice(checkoutData.finalPrice)}
                </div>
                <p className="text-sm text-gray-500 mt-2">Termasuk kode unik</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pilih Metode Pembayaran</h2>
                
                {Object.entries(groupedMethods).map(([category, methods]) => (
                  <div key={category} className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase">{category}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {methods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            console.log('[Payment] Selected:', method.id)
                            setSelectedPaymentMethod(method.id)
                          }}
                          disabled={paymentLink !== null || processingPayment}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-2 ${
                            selectedPaymentMethod === method.id
                              ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-300'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          } ${paymentLink || processingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="text-xl">{method.icon}</span>
                          <span className="font-medium text-sm">{method.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleCreatePayment}
                  disabled={saving || processingPayment || !savedToSheet || !selectedPaymentMethod}
                  className={`w-full py-4 px-6 rounded-2xl transition-all duration-300 font-bold text-lg mt-4 ${
                    saving || processingPayment || !savedToSheet || !selectedPaymentMethod
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700'
                  }`}
                >
                  {processingPayment ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Membuat Pembayaran...
                    </span>
                  ) : saving ? (
                    'Menyimpan...'
                  ) : !selectedPaymentMethod ? (
                    'Pilih Metode Pembayaran'
                  ) : (
                    '💳 Bayar Sekarang'
                  )}
                </button>

                {paymentLink && (
                  <div className="mt-6 space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-green-700 font-medium">✓ Link pembayaran berhasil dibuat!</p>
                    </div>
                    <a
                      href={paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-4 px-6 rounded-2xl bg-green-500 text-white text-center font-bold hover:bg-green-600"
                    >
                      🔗 Buka Halaman Pembayaran DOKU
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentLink(null)
                        setSelectedPaymentMethod(null)
                      }}
                      className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                    >
                      Pilih Metode Lain
                    </button>
                  </div>
                )}
              </div>

              {!paymentConfirmed ? (
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={!savedToSheet || !paymentLink}
                  className={`w-full py-4 px-6 rounded-2xl transition-all duration-300 font-bold text-lg ${
                    !savedToSheet || !paymentLink
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  ✓ Konfirmasi Pembayaran
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleWhatsAppConfirmation}
                  className="w-full py-4 px-6 rounded-2xl bg-green-500 text-white font-bold text-lg hover:bg-green-600"
                >
                  💬 Kirim Bukti ke WhatsApp
                </button>
              )}

              <Link
                href="/"
                className="block text-center text-gray-600 hover:text-gray-900"
              >
                ← Kembali ke Toko
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}