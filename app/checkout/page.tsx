'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import { getUniqueCodeAmount } from '@/lib/checkout'
import type { CheckoutData, PromoCode } from '@/types/product'

interface PromoValidation {
  success: boolean
  data?: PromoCode
  message?: string
}

interface StoreSettings {
  adminPhone?: string
  storeEmail?: string
  storeName?: string
}

function isCheckoutData(value: unknown): value is CheckoutData {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<CheckoutData>
  return (
    typeof data.productId === 'string' &&
    typeof data.productName === 'string' &&
    typeof data.buyerName === 'string' &&
    typeof data.buyerPhone === 'string' &&
    typeof data.uniqueCode === 'string' &&
    Number.isFinite(Number(data.originalPrice))
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentStep, setPaymentStep] = useState<'select' | 'done'>('select')

  // Promo code state
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState<PromoValidation | null>(null)
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)

  // Variant price validation
  const [validatedPrice, setValidatedPrice] = useState<number | null>(null)
  const [priceMismatch, setPriceMismatch] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('checkoutData')
    if (!raw) {
      router.replace('/')
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      sessionStorage.removeItem('checkoutData')
      router.replace('/')
      return
    }

    if (!isCheckoutData(parsed)) {
      sessionStorage.removeItem('checkoutData')
      router.replace('/')
      return
    }

    const validData = parsed
    setCheckoutData(validData)

    const loadPageData = async () => {
      try {
        const settingsResponse = await fetch('/api/settings', { cache: 'no-store' })
        const settingsData = await settingsResponse.json()
        if (settingsData.success && settingsData.data) {
          setSettings(settingsData.data)
        }

        if (validData.combinationId && validData.productId) {
          const priceResponse = await fetch(
            `/api/products/${encodeURIComponent(validData.productId)}/combinations/${encodeURIComponent(validData.combinationId)}`,
            { cache: 'no-store' }
          )
          const priceResult = await priceResponse.json()

          if (priceResult.success && priceResult.data) {
            const backendPrice = Number(priceResult.data.price)
            if (Number.isFinite(backendPrice)) {
              setValidatedPrice(backendPrice)
              if (Math.abs(backendPrice - validData.originalPrice) > 100) {
                setPriceMismatch(true)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading checkout data:', error)
      } finally {
        setLoading(false)
      }
    }

    void loadPageData()
  }, [router])

  const applyPromoCode = async () => {
    if (!promoCode.trim() || !checkoutData) return

    setApplyingPromo(true)
    setPromoError('')

    try {
      const basePrice = validatedPrice ?? checkoutData.originalPrice
      const response = await fetch(`/api/promo-codes?code=${encodeURIComponent(promoCode.trim())}`, {
        cache: 'no-store',
      })
      const result = await response.json()

      if (!result.success || !result.data) {
        setPromoError(result.message || 'Kode promo tidak valid')
        return
      }

      const promo = result.data as PromoCode
      const minPurchase = Number(promo['Minimal Pembelian']) || 0
      if (minPurchase > 0 && basePrice < minPurchase) {
        setPromoError(`Minimal pembelian Rp ${minPurchase.toLocaleString('id-ID')}`)
        return
      }

      let discount =
        promo['Tipe Diskon'] === 'percentage'
          ? (basePrice * Number(promo.Diskon || 0)) / 100
          : Number(promo.Diskon || 0)

      const maxDiscount = Number(promo['Maksimal Diskon']) || 0
      if (maxDiscount > 0) discount = Math.min(discount, maxDiscount)
      discount = Math.round(Math.max(0, Math.min(discount, basePrice)))

      setDiscountAmount(discount)
      setPromoApplied(result)
    } catch (error) {
      console.error('Error applying promo code:', error)
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

  const handleCopyCode = async () => {
    if (!checkoutData?.uniqueCode) return
    try {
      await navigator.clipboard.writeText(checkoutData.uniqueCode)
    } catch {
      // Clipboard permissions are not guaranteed; the code is visible on screen.
    }
  }

  const getWhatsAppNumber = () => String(settings?.adminPhone || '').replace(/\D/g, '')
  const getStoreName = () => settings?.storeName || 'Langgoku'

  const handleWhatsAppConfirmation = () => {
    if (!checkoutData) return

    const adminNumber = getWhatsAppNumber()
    if (!adminNumber) {
      alert('Nomor WhatsApp admin belum dikonfigurasi. Silakan hubungi admin melalui cara lain.')
      return
    }

    const basePrice = validatedPrice !== null ? validatedPrice : checkoutData.originalPrice
    const total = Math.max(0, basePrice - discountAmount)
    const uniqueCodeAmount =
      checkoutData.uniqueCodeAmount ?? getUniqueCodeAmount(checkoutData.uniqueCode)
    const promoInfo =
      promoApplied && discountAmount > 0
        ? `\n🎫 Promo: ${promoCode} (-${formatPrice(discountAmount)})`
        : ''
    const variantInfo = checkoutData.variantName
      ? `\n🎯 Varian: ${checkoutData.variantName}`
      : ''

    const message = `Halo Admin ${getStoreName()}, saya ingin membeli:

📦 Produk: ${checkoutData.productName}${variantInfo}
⏱️ Durasi: ${checkoutData.productDuration || '-'}
👤 Nama: ${checkoutData.buyerName}
📱 WhatsApp: ${checkoutData.buyerPhone}
💵 Harga Awal: ${formatPrice(basePrice)}${promoInfo}
💰 Kode Pembayaran: ${checkoutData.uniqueCode}
💳 Total Bayar: ${formatPrice(total + uniqueCodeAmount)}

Mohon info cara pembayarannya!`

    window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`, '_blank')
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

  const basePrice = validatedPrice !== null ? validatedPrice : checkoutData.originalPrice
  const finalTotal = Math.max(0, basePrice - discountAmount)
  const uniqueCodeAmount =
    checkoutData.uniqueCodeAmount ?? getUniqueCodeAmount(checkoutData.uniqueCode)
  const grandTotal = finalTotal + uniqueCodeAmount

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
                  {checkoutData.variantName && (
                    <p className="text-sm text-purple-600 font-medium mt-1">
                      Varian: {checkoutData.variantName}
                    </p>
                  )}
                  <p className="text-gray-600">{checkoutData.productDuration || '-'}</p>
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
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">Tambahkan ke nominal transfer</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-lg font-semibold">{formatPrice(basePrice)}</p>
                  {validatedPrice !== null && validatedPrice !== checkoutData.originalPrice && (
                    <p className="text-xs text-blue-600 mt-1">Harga divalidasi dari backend</p>
                  )}
                  {priceMismatch && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠ Perbedaan harga terdeteksi - menggunakan harga backend
                    </p>
                  )}
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
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(grandTotal)}</p>
                  {uniqueCodeAmount > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Termasuk kode unik {formatPrice(uniqueCodeAmount)}
                    </p>
                  )}
                  {validatedPrice !== null && validatedPrice !== checkoutData.originalPrice && (
                    <p className="text-xs text-blue-600 mt-1">Harga divalidasi dari backend</p>
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
                  onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
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
                      : `Rp ${Number(promoApplied.data?.Diskon || 0).toLocaleString('id-ID')} off`}
                  </p>
                </div>
                <button onClick={removePromo} className="text-red-500 hover:text-red-700">
                  ✕
                </button>
              </div>
            )}

            {promoError && <p className="mt-2 text-red-500 text-sm">{promoError}</p>}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Cara Pembayaran</h2>
            <p className="text-gray-600 mb-4">
              Klik tombol &quot;Hubungi Admin via WhatsApp&quot; untuk mendapatkan informasi cara
              pembayaran. Admin akan memberikan nomor rekening atau panduan pembayaran.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Catatan:</strong> Setiap pesanan memiliki kode unik (
                {checkoutData.uniqueCode}) yang harus ditambahkan ke nominal pembayaran. Hubungi admin
                untuk info lebih lanjut.
              </p>
            </div>
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppConfirmation}
            className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 0 5.463 0 12.045c0 2.124.555 4.196 1.61 6.024L0 24l6.104-1.6a12.02 12.02 0 005.94 1.52h.005c6.582 0 12.045-5.463 12.045-12.045 0-3.213-1.265-6.221-3.574-8.426zM12.05 21.785h-.004a9.96 9.96 0 01-5.073-1.39l-.364-.216-3.622.95.967-3.53-.237-.377a9.958 9.958 0 01-1.527-5.177c0-5.507 4.48-9.987 9.99-9.987 2.667 0 5.174 1.04 7.06 2.928a9.926 9.926 0 012.922 7.068c0 5.507-4.48 9.986-9.987 9.986z" />
            </svg>
            Hubungi Admin via WhatsApp
          </button>

          {paymentStep === 'done' && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-medium">
                ✓ Pesanan diterima! Silakan hubungi admin melalui WhatsApp.
              </p>
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
