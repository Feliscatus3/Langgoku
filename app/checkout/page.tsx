'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/googleSheets'

interface CheckoutData {
  productId: string
  productName: string
  originalPrice: number
  uniqueCode: string
  finalPrice: number
  buyerName: string
  buyerPhone: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem('checkoutData')
    if (!data) {
      router.push('/')
      return
    }
    setCheckoutData(JSON.parse(data))
  }, [router])

  const handleCopyCode = () => {
    if (checkoutData?.uniqueCode) {
      navigator.clipboard.writeText(checkoutData.uniqueCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWhatsAppConfirmation = () => {
    if (!checkoutData) return

    const message = `Halo, saya ingin membeli ${checkoutData.productName}\nNama: ${checkoutData.buyerName}\nKode Pembayaran: ${checkoutData.uniqueCode}\nHarga: ${formatPrice(checkoutData.finalPrice)}`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${checkoutData.buyerPhone.replace(/\D/g, '')}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  if (!checkoutData) {
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black mb-4">Konfirmasi Pembayaran</h1>
            <p className="text-xl text-blue-100">Lengkapi pembayaran untuk mendapatkan akun premium Anda</p>
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Order Summary */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">📦</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ringkasan Pesanan</h2>
                    <p className="text-gray-600">Detail produk yang Anda pesan</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Produk</p>
                    <p className="text-2xl font-bold text-gray-900">{checkoutData.productName}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-gray-50 to-green-50 p-6 rounded-2xl border border-gray-200">
                      <p className="text-sm font-semibold text-gray-600 mb-2">Nama Pembeli</p>
                      <p className="text-lg font-semibold text-gray-900">{checkoutData.buyerName}</p>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-6 rounded-2xl border border-gray-200">
                      <p className="text-sm font-semibold text-gray-600 mb-2">No. WhatsApp</p>
                      <p className="text-lg font-semibold text-gray-900">{checkoutData.buyerPhone}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
                    <p className="text-sm font-semibold text-amber-800 mb-3">Kode Pembayaran Unik</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={checkoutData.uniqueCode}
                        readOnly
                        className="flex-1 bg-white border-2 border-amber-300 rounded-xl px-4 py-3 font-bold text-2xl text-amber-800 text-center outline-none"
                      />
                      <button
                        onClick={handleCopyCode}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-bold transform hover:scale-105 shadow-lg"
                      >
                        {copied ? '✅ Tersalin' : '📋 Salin'}
                      </button>
                    </div>
                    <p className="text-xs text-amber-700 font-medium mt-3 flex items-center gap-2">
                      <span className="text-amber-600">⚠️</span>
                      Tambahkan kode ini ke nominal pembayaran Anda
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  Rincian Pembayaran
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">Harga Produk</span>
                    <span className="text-lg font-semibold text-gray-900">{formatPrice(checkoutData.originalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-amber-700 font-medium">Kode Unik</span>
                    <span className="text-lg font-semibold text-amber-700">+{Math.round(checkoutData.finalPrice - checkoutData.originalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 rounded-xl border-2 border-blue-200">
                    <span className="text-xl font-bold text-gray-900">Total Pembayaran</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      {formatPrice(checkoutData.finalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-8">
              {/* QRIS Payment */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">📱</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Pembayaran QRIS</h2>
                    <p className="text-gray-600">Scan QR code untuk pembayaran instan</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-green-50 p-8 rounded-2xl border-2 border-green-200 mb-6">
                  <div className="text-center">
                    <div className="w-48 h-48 bg-white rounded-2xl mx-auto mb-4 border-4 border-dashed border-green-300 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-6xl">📱</span>
                        <p className="text-gray-600 font-medium mt-2">QR Code</p>
                        <p className="text-xs text-gray-500">(Tempatkan qris.png di /public/images/)</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Scan dengan aplikasi e-wallet Anda
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-8">
                <h4 className="font-bold text-amber-900 mb-6 text-xl flex items-center gap-3">
                  <span className="text-2xl">🚀</span>
                  Panduan Pembayaran
                </h4>
                <div className="space-y-4">
                  {[
                    'Scan QRIS atau transfer ke rekening yang tersedia',
                    'Tambahkan kode unik di akhir nominal pembayaran',
                    'Konfirmasi pembayaran melalui WhatsApp',
                    'Akun akan dikirim dalam 5-15 menit'
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-amber-900 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleWhatsAppConfirmation}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-3 text-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.89 10.525 1.891 3.368 5.853 4.795 9.797 3.488 3.368-1.079 5.82-4.15 5.428-7.418-.167-1.334-1.01-2.502-2.149-3.162-1.147-.medalist-2.295-1.023-3.958-.645z"/>
                  </svg>
                  💬 Konfirmasi Pembayaran via WhatsApp
                </button>

                <Link
                  href="/"
                  className="block w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 px-8 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-center shadow-lg"
                >
                  ← Kembali ke Toko
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
