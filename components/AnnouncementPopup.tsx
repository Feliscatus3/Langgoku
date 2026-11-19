'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PromoAd } from '@/types/product'

interface Settings {
  announcementText: string
  announcementEnabled: boolean
}

const PROMO_DISMISS_MINUTES = 10

export default function AnnouncementPopup() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [promoAds, setPromoAds] = useState<PromoAd[]>([])
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [showPromoAd, setShowPromoAd] = useState(false)
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      // A new browser session always shows the popup once.
      const isNewSession = !sessionStorage.getItem('promo_session_active')
      if (isNewSession) {
        sessionStorage.setItem('promo_session_active', 'true')
      }

      const [settingsRes, promoRes] = await Promise.all([
        fetch('/api/settings', { cache: 'no-store' }),
        fetch('/api/promo-ads', { cache: 'no-store' }),
      ])
      const settingsData = await settingsRes.json()
      const promoData = await promoRes.json()

      if (settingsData.success && settingsData.data) {
        setSettings(settingsData.data)
        if (settingsData.data.announcementEnabled && settingsData.data.announcementText) {
          const dismissed = localStorage.getItem('announcement_dismissed')
          if (dismissed !== new Date().toDateString()) {
            setShowAnnouncement(true)
          }
        }
      }

      if (promoData.success && Array.isArray(promoData.data)) {
        const activeAds = (promoData.data as PromoAd[]).filter(
          (ad) => ad.Aktif !== false && Boolean(ad['URL Gambar'])
        )

        if (activeAds.length > 0) {
          setPromoAds(activeAds)
          setCurrentPromoIndex(0)

          const dismissedUntil = localStorage.getItem('promo_ad_dismissed')
          const until = dismissedUntil ? new Date(dismissedUntil).getTime() : 0
          const stillDismissed = Number.isFinite(until) && Date.now() < until

          if (isNewSession || !stillDismissed) {
            setShowPromoAd(true)
          }
        }
      }
    } catch (err) {
      console.error('Error loading popup data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const closeAnnouncement = () => {
    setShowAnnouncement(false)
    // Remember for today
    localStorage.setItem('announcement_dismissed', new Date().toDateString())
  }

  const closePromoAd = () => {
    setShowPromoAd(false)
    const dismissedUntil = new Date()
    dismissedUntil.setMinutes(dismissedUntil.getMinutes() + PROMO_DISMISS_MINUTES)
    localStorage.setItem('promo_ad_dismissed', dismissedUntil.toISOString())
  }

  const nextPromo = () => {
    setCurrentPromoIndex((prev) => (prev + 1) % promoAds.length)
  }

  const prevPromo = () => {
    setCurrentPromoIndex((prev) => (prev - 1 + promoAds.length) % promoAds.length)
  }

  const handlePromoClick = () => {
    const currentAd = promoAds[currentPromoIndex]
    if (currentAd?.['URL Link']) {
      window.open(currentAd['URL Link'], '_blank')
    }
  }

  if (loading) {
    return null
  }

  // Don't show on admin or API routes
  if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/api'))) {
    return null
  }

  return (
    <>
      {/* Announcement Popup */}
      {showAnnouncement && settings?.announcementEnabled && settings?.announcementText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeAnnouncement}
          ></div>
          
          {/* Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-[fadeIn_0.3s_ease-out]">
            {/* Close button */}
            <button
              onClick={closeAnnouncement}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Pengumuman</h2>
            </div>
            
            {/* Text */}
            <div className="text-center">
              <p className="text-gray-600 whitespace-pre-wrap">
                {settings.announcementText}
              </p>
            </div>
            
            {/* Button */}
            <div className="mt-6 text-center">
              <button
                onClick={closeAnnouncement}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Ad Popup - Center position for both mobile and desktop */}
      {showPromoAd && promoAds.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - click to close */}
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={closePromoAd}
          ></div>
          
          {/* Content - centered, medium size */}
          <div className="relative max-w-md w-full mx-4 animate-[fadeIn_0.3s_ease-out]">
            {/* Close button - visible on mobile only */}
            <button
              onClick={closePromoAd}
              className="absolute -top-2 -right-2 z-10 md:hidden bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 shadow-lg"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image card */}
            <div 
              className="relative bg-white rounded-2xl shadow-2xl overflow-hidden cursor-pointer hover:shadow-3xl transition-shadow"
              onClick={handlePromoClick}
            >
              {/* Image with aspect ratio suitable for both mobile and desktop */}
              <div className="aspect-[4/3] bg-gray-100 relative">
                {promoAds[currentPromoIndex]['URL Gambar'] ? (
                  // Promo ad URLs are supplied by the store admin and can be any
                  // public host, so the plain <img> element is intentional here.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={promoAds[currentPromoIndex]['URL Gambar']}
                    alt={promoAds[currentPromoIndex].Judul || 'Promo'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Tidak ada gambar
                  </div>
                )}
                
                {/* Navigation arrows if multiple ads */}
                {promoAds.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevPromo() }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md"
                    >
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextPromo() }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md"
                    >
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Info */}
              {(promoAds[currentPromoIndex].Judul || promoAds[currentPromoIndex].Deskripsi) && (
                <div className="p-3 bg-white">
                  {promoAds[currentPromoIndex].Judul && (
                    <h3 className="font-bold text-gray-900 text-sm">{promoAds[currentPromoIndex].Judul}</h3>
                  )}
                  {promoAds[currentPromoIndex].Deskripsi && (
                    <p className="text-xs text-gray-600 mt-1">{promoAds[currentPromoIndex].Deskripsi}</p>
                  )}
                </div>
              )}
              
              {/* Dots indicator */}
              {promoAds.length > 1 && (
                <div className="flex justify-center gap-1.5 pb-3">
                  {promoAds.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentPromoIndex(idx) }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentPromoIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}