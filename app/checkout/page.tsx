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
      <div className="container-custom py-16">
        <p className="text-blue-600 font-medium">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold text-gradient mb-12 text-center">Konfirmasi Pembayaran</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Order Summary */}
          <div className="card p-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gradient mb-8">Ringkasan Pesanan</h2>
            
            <div className="space-y-5 mb-8">
              <div className="border-b border-gray-100 pb-4">
                <p className="text-gray-600 text-sm font-semibold mb-1">Produk</p>
                <p className="text-2xl font-bold text-gray-900">{checkoutData.productName}</p>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <p className="text-gray-600 text-sm font-semibold mb-1">Nama Pembeli</p>
                <p className="text-xl font-semibold text-gray-900">{checkoutData.buyerName}</p>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <p className="text-gray-600 text-sm font-semibold mb-1">No. WhatsApp</p>
                <p className="text-xl font-semibold text-gray-700">{checkoutData.buyerPhone}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm font-semibold mb-3">Kode Pembayaran Unik</p>
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-gray-50 p-4 rounded-2xl border border-amber-200">
                  <input
                    type="text"
                    value={checkoutData.uniqueCode}
                    readOnly
                    className="flex-1 bg-transparent font-bold text-2xl text-gradient outline-none"
                  />
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-bold transform hover:scale-105 duration-300"
                  >
                    {copied ? 'Salin' : 'Salin'}
                  </button>
                </div>
                <p className="text-xs text-gray-600 font-medium mt-3">
                  ⚠️ Tambahkan kode ini ke nominal pembayaran Anda
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gradient-to-r from-gray-50 to-amber-50 p-6 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Harga Produk</span>
                <span>{formatPrice(checkoutData.originalPrice)}</span>
              </div>
              <div className="flex justify-between text-amber-700 font-medium">
                <span>Kode Unik</span>
                <span className="text-amber-600">+{Math.round(checkoutData.finalPrice - checkoutData.originalPrice)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3" />
              <div className="flex justify-between text-2xl font-bold text-gradient">
                <span>Total</span>
                <span>{formatPrice(checkoutData.finalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-6">
            {/* QRIS */}
            <div className="card p-8 border border-amber-200">
              <h3 className="text-2xl font-bold text-gradient mb-6">📱 Pembayaran via QRIS</h3>
              <div className="bg-gradient-to-br from-gray-100 to-amber-50 p-6 rounded-2xl flex items-center justify-center h-64 mb-6 border border-gray-200">
                <div className="text-center">
                  <p className="text-gray-700 font-bold mb-2">QR Code</p>
                  <p className="text-sm text-gray-600">(Tempatkan qris.png di /public/images/)</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center font-medium mb-4">
                Scan QRIS dengan aplikasi pembayaran Anda
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6">
              <h4 className="font-bold text-amber-900 mb-4 text-lg flex items-center gap-2">
                🚀 Cara Pembayaran
              </h4>
              <ol className="text-sm text-amber-900 space-y-3 list-decimal list-inside font-medium">
                <li>Scan QRIS atau transfer manual ke nomor yang tertera</li>
                <li>Masukkan kode unik di akhir nominal pembayaran</li>
                <li>Konfirmasi pembayaran melalui WhatsApp</li>
                <li>Akun akan dikirim dalam 5-15 menit</li>
              </ol>
            </div>

              {/* WhatsApp Confirmation */}
            <button
              onClick={handleWhatsAppConfirmation}
              className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-3 hover:shadow-glow-primary"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.89 10.525 1.891 3.368 5.853 4.795 9.797 3.488 3.368-1.079 5.82-4.15 5.428-7.418-.167-1.334-1.01-2.502-2.149-3.162-1.147-.medalist-2.295-1.023-3.958-.645z"/>
              </svg>
              💬 Konfirmasi via WhatsApp
            </button>

            <Link href="/" className="btn-secondary block text-center py-3 font-semibold">
              ← Kembali ke Toko
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
