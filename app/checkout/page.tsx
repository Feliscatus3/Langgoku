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

interface Settings {
  adminPhone: string
  storeEmail: string
  storeName: string
  storeDescription: string
}

interface PromoValidation {
  success: boolean
  data?: {
    'Kode Promo': string
    Diskon: number
    'Tipe Diskon': string
    'Minimal Pembelian': number
    'Maksimal Diskon': number
  }
  message?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentStep, setPaymentStep] = useState<'select' | 'done'>('select')
  const [settingsLoading, setSettingsLoading] = useState(true)
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState<PromoValidation | null>(null)
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [promoError, setPromoError] = useState('')
  
  // Price after promo
  const [discountAmount, setDiscountAmount] = useState(0)

  useEffect(() => {
    const data = sessionStorage.getItem('checkoutData')
    if (!data) {
      router.push('/')
      return
    }
    setCheckoutData(JSON.parse(data))
    loadSettings()
  }, [router])

  const loadSettings = async () => {
    setSettingsLoading(true)
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      console.log('Settings response:', data)
      if (data.success && data.data) {
        setSettings(data.data)
        console.log('Admin phone from settings:', data.data.adminPhone)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    } finally {
      setLoading(false)
      setSettingsLoading(false)
    }
  }

  const applyPromoCode = async () => {
    if (!promoCode.trim() || !checkoutData) return
    
    setApplyingPromo(true)
    setPromoError('')
    
    try {
      const response = await fetch(`/api/promo-codes?code=${encodeURIComponent(promoCode)}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const promo = result.data
        let discount = 0
        
        // Calculate discount
        if (promo['Tipe Diskon'] === 'percentage') {
          discount = (checkoutData.originalPrice * promo.Diskon) / 100
          // Apply max discount cap
          if (promo['Maksimal Diskon'] && discount > promo['Maksimal Diskon']) {
            discount = promo['Maksimal Diskon']
          }
        } else {
          discount = promo.Diskon
        }
        
        // Check min purchase
        if (promo['Minimal Pembelian'] && checkoutData.originalPrice < promo['Minimal Pembelian']) {
          setPromoError(`Minimal pembelian Rp ${promo['Minimal Pembelian'].toLocaleString('id-ID')}`)
          return
        }
        
        setDiscountAmount(discount)
        setPromoApplied(result)
      } else {
        setPromoError(result.message || 'Kode promo tidak valid')
      }
    } catch (err) {
      setPromoError('Terjadi kesalahan')
    } finally {
      setApplyingPromo(false)
    }
  }

  const removePromo = () => {
    setPromoCode('')
    setPromoApplied(null)
    setDiscountAmount(0)
    setPromoError('')
  }

  const handleCopyCode = () => {
    if (checkoutData?.uniqueCode) {
      navigator.clipboard.writeText(checkoutData.uniqueCode)
    }
  }

  const getWhatsAppNumber = () => {
    // First priority: settings adminPhone from Google Sheets
    if (settings?.adminPhone) {
      return String(settings.adminPhone)
    }
    // Fallback: buyer phone (not ideal but better than nothing)
    return String(checkoutData?.buyerPhone || '')
  }

  const getStoreName = () => {
    return settings?.storeName || 'Langgoku'
  }

  const handleWhatsAppConfirmation = () => {
    if (!checkoutData) return

    const waNumber = getWhatsAppNumber()
    console.log('Using WhatsApp number:', waNumber)
    
    if (!waNumber) {
      alert('Nomor WhatsApp admin belum dikonfigurasi. Silakan hubungi admin melalui cara lain.')
      return
    }

    const finalPrice = checkoutData.finalPrice - discountAmount
    const promoInfo = promoApplied ? `\n🎫 Promo: ${promoCode} (-${formatPrice(discountAmount)})` : ''
    const uniqueCodeNum = parseInt(checkoutData.uniqueCode) || 0
    
    const productDuration = checkoutData.productDuration || 'Tidak ada durasi'
    
    const message = `Halo Admin ${getStoreName()}, saya ingin membeli:

📦 Produk: ${checkoutData.productName}
⏱️ Durasi: ${productDuration}
👤 Nama: ${checkoutData.buyerName}
📱 WhatsApp: ${checkoutData.buyerPhone}
💵 Harga Awal: ${formatPrice(checkoutData.originalPrice)}${promoInfo}
💰 Kode Pembayaran: ${checkoutData.uniqueCode}
💳 Total Bayar: ${formatPrice(finalPrice + uniqueCodeNum)}

Mohon info cara pembayarannya!`
    
    const cleanNumber = waNumber.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank')
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

  const finalTotal = checkoutData.finalPrice - discountAmount

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
          <p className="text-blue-200">Pesanan Anda di {getStoreName()}</p>
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

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Email Toko</p>
                  <p className="font-semibold">{settings?.storeEmail || '-'}</p>
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
                  <p className="text-xs text-amber-600 mt-1">Tambahkan ke nominal transfer</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-lg font-semibold">{formatPrice(checkoutData.originalPrice)}</p>
                </div>

                {promoApplied && discountAmount > 0 && (
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-purple-600">Diskon Promo</p>
                        <p className="text-lg font-bold text-purple-600">-{formatPrice(discountAmount)}</p>
                      </div>
                      <button onClick={removePromo} className="text-purple-500 text-sm hover:text-purple-700">
                        Hapus
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Total Bayar</p>
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(finalTotal)}</p>
                  {discountAmount > 0 && (
                    <p className="text-xs text-green-600 mt-1">Termasuk kode unik</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Kode Promo</h2>
            
            {!promoApplied ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode promo"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={applyPromoCode}
                  disabled={applyingPromo || !promoCode.trim()}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {applyingPromo ? '...' : ' Gunakan'}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-700">✓ {promoCode} Applied</p>
                  <p className="text-sm text-green-600">
                    {promoApplied.data?.['Tipe Diskon'] === 'percentage' 
                      ? `${promoApplied.data?.Diskon}% off` 
                      : `Rp ${promoApplied.data?.Diskon?.toLocaleString('id-ID')} off`}
                  </p>
                </div>
                <button
                  onClick={removePromo}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}
            
            {promoError && (
              <p className="mt-2 text-red-500 text-sm">{promoError}</p>
            )}
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
                <strong>Catatan:</strong> Setiap pesanan memiliki kode unik ({checkoutData.uniqueCode}) yang harus ditambahkan ke nominal pembayaran.
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
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 00.672.038l2.384-1.002a.863.863 0 01.798-.098c1.462.45 2.38.918 2.38.918.438-.086.952-.328 1.542-.912 1.462-1.456 2.448-4.354 2.448-4.354s-.774-.898-2.032-2.331c-.918-1.048-1.962-1.248-2.532-1.374-.532-.118-1.346-.166-2.432-.038-.628.074-2.292.378-4.358 1.706L4.37 4.657A.484.484 0 014.17 4.31l-.552.062-.236.552.688.178.002-.002.002.002.656-.096.002.002.002-.002.314.096c.094.088.232.194.374.306l.002-.002.002-.002.002.002-.096.656-.002.002.002.096a.485.485 0 01-.346.348l2.402.998a.864.864 0 01.097.798c-.002 0-.468.918-.918 2.38 0 0-.012.217-.062.346l.002-.002-.002-.002zM5.748 8.5c.584 0 1.058.474 1.058 1.058 0 .584-.474 1.058-1.058 1.058-.584 0-1.058-.474-1.058-1.058 0-.584.474-1.058 1.058-1.058zm5.772 0c.584 0 1.058.474 1.058 1.058 0 .584-.474 1.058-1.058 1.058-.584 0-1.058-.474-1.058-1.058 0-.584.474-1.058 1.058-1.058zm4.592 2.636c-1.458 0-2.774.378-3.996 1.082-1.278.736-2.244 1.702-2.996 2.996C3.28 16.18 2.902 17.494 2.902 18.952c0 1.578.628 3.016 1.634 4.096 1.004 1.078 2.38 1.706 3.952 1.706 1.576 0 2.948-.628 4.034-1.706 1.088-1.078 1.716-2.518 1.716-4.096 0-1.458-.378-2.774-1.082-3.996-.736-1.278-1.702-2.244-2.996-2.996-1.222-.704-2.538-1.082-3.996-1.082z"/>
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