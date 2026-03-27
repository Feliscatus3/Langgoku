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

export default function CheckoutPage() {
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'done'>('select')

  useEffect(() => {
    const data = sessionStorage.getItem('checkoutData')
    if (!data) {
      router.push('/')
      return
    }
    setCheckoutData(JSON.parse(data))
    setLoading(false)
  }, [router])

  const handlePayWithDoku = () => {
    if (!checkoutData) return
    
    // Direct link to DOKU sandbox payment simulator
    const dokuUrl = `https://sandbox.doku.com/simulator/merchant/creditcard/initiate`
    
    // Open in new tab
    window.open(dokuUrl, '_blank')
    
    setPaymentStep('done')
  }

  const handleCopyCode = () => {
    if (checkoutData?.uniqueCode) {
      navigator.clipboard.writeText(checkoutData.uniqueCode)
    }
  }

  const handleWhatsAppConfirmation = () => {
    if (!checkoutData) return

    const message = `Halo Admin Langgoku, saya ingin membeli:

📦 Produk: ${checkoutData.productName}
👤 Nama: ${checkoutData.buyerName}
📱 No. WhatsApp: ${checkoutData.buyerPhone}
💵 Total: ${formatPrice(checkoutData.finalPrice)}
💰 Kode Pembayaran: ${checkoutData.uniqueCode}

Saya akan membayar melalui DOKU. Mohon infonya!`
    
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
          <h1 className="text-3xl font-bold">Checkout - Pembayaran DOKU</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
            
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

              <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200">
                <p className="text-sm font-semibold text-amber-800">Kode Pembayaran (+ ke harga)</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-amber-700">{checkoutData.uniqueCode}</span>
                  <button onClick={handleCopyCode} className="text-amber-600">📋</button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Bayar</span>
                <span className="text-2xl font-bold text-purple-600">{formatPrice(checkoutData.finalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            
            {/* DOKU Payment Box */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💳</span>
                </div>
                <h2 className="text-xl font-bold">Bayar dengan DOKU</h2>
                <p className="text-gray-600 text-sm">Pilih metode pembayaran di simulator DOKU</p>
              </div>

              {paymentStep === 'select' && (
                <button
                  onClick={handlePayWithDoku}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105"
                >
                  🔗 Buka Simulator Pembayaran DOKU
                </button>
              )}

              {paymentStep === 'processing' && (
                <div className="text-center py-8">
                  <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Memproses pembayaran...</p>
                </div>
              )}

              {paymentStep === 'done' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-green-700 font-medium">✓ Simulator DOKU dibuka!</p>
                    <p className="text-sm text-green-600">Lanjutkan pembayaran di tab baru</p>
                  </div>
                  
                  <button
                    onClick={handlePayWithDoku}
                    className="w-full py-3 border-2 border-purple-500 text-purple-600 font-bold rounded-xl hover:bg-purple-50"
                  >
                    🔄 Buka Ulang Simulator
                  </button>
                </div>
              )}
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-bold text-blue-900 mb-3">Cara Pembayaran:</h3>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. Klik tombol "Buka Simulator Pembayaran DOKU"</li>
                <li>2. Di halaman DOKU, pilih metode pembayaran:</li>
                <li className="ml-4">• Virtual Account (BCA, BRI, Mandiri, dll)</li>
                <li className="ml-4">• E-Wallet (DANA, OVO, ShopeePay)</li>
                <li className="ml-4">• QRIS</li>
                <li className="ml-4">• Kartu Kredit</li>
                <li className="ml-4">• Alfamart/Indomaret</li>
                <li>3. Ikuti instruksi pembayaran</li>
                <li>4. Simpan bukti transaksi</li>
                <li>5. Klik tombol WhatsApp di bawah untuk konfirmasi</li>
              </ol>
            </div>

            {/* WhatsApp Confirmation */}
            <button
              onClick={handleWhatsAppConfirmation}
              className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.89 10.525 1.891 3.368 5.853 4.795 9.797 3.488 3.368-1.079 5.82-4.15 5.428-7.418-.167-1.334-1.01-2.502-2.149-3.162-1.147-.medalist-2.295-1.023-3.958-.645z"/>
              </svg>
              Hubungi Admin via WhatsApp
            </button>

            <Link href="/" className="block text-center text-gray-600 hover:text-gray-900">
              ← Kembali ke Toko
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}