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
  const [paymentStep, setPaymentStep] = useState<'select' | 'done'>('select')

  useEffect(() => {
    const data = sessionStorage.getItem('checkoutData')
    if (!data) {
      router.push('/')
      return
    }
    setCheckoutData(JSON.parse(data))
    setLoading(false)
  }, [router])

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
📱 WhatsApp: ${checkoutData.buyerPhone}
💵 Total: ${formatPrice(checkoutData.finalPrice)}
💰 Kode Pembayaran: ${checkoutData.uniqueCode}

Mohon info cara pembayarannya!`
    
    window.open(`https://wa.me/${checkoutData.buyerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
    setPaymentStep('done')
  }

  if (loading || !checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-blue-200">Pesanan Anda</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl">
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

                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Total Bayar</p>
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(checkoutData.finalPrice)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Cara Pembayaran</h2>
            <p className="text-gray-600 mb-4">
              Klik tombol "Hubungi Admin via WhatsApp" untuk mendapatkan informasi cara pembayaran. 
              Admin akan memberikan nomor rekening atau panduan pembayaran.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Catatan:</strong> Setiap pesanan memiliki kode unik yang harus ditambahkan ke nominal pembayaran.
                Hubungi admin untuk info lebih lanjut.
              </p>
            </div>
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppConfirmation}
            className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.89 10.525 1.891 3.368 5.853 4.795 9.797 3.488 3.368-1.079 5.82-4.15 5.428-7.418-.167-1.334-1.01-2.502-2.149-3.162-1.147-.medalist-2.295-1.023-3.958-.645z"/>
            </svg>
            Hubungi Admin via WhatsApp
          </button>

          {paymentStep === 'done' && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-medium">✓ Pesanan diterima! Silakan hubungi admin melalui WhatsApp.</p>
            </div>
          )}

          <Link href="/" className="block text-center text-gray-600 hover:text-gray-900 mt-4">
            ← Kembali ke Toko
          </Link>
        </div>
      </div>
    </div>
  )
}