'use client'

import { useState, useEffect } from 'react'

interface Settings {
  announcementText: string
  announcementEnabled: boolean
}

interface PromoAd {
  ID: string
  'URL Gambar': string
  Judul: string
  Deskripsi: string
  'URL Link': string
  Aktif: boolean
}

export default function AnnouncementPopup() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [promoAds, setPromoAds] = useState<PromoAd[]>([])
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [showPromoAd, setShowPromoAd] = useState(false)
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load settings
      const settingsRes = await fetch('/api/settings')
      const settingsData = await settingsRes.json()
      
      // Load promo ads
      const promoRes = await fetch('/api/promo-ads')
      const promoData = await promoRes.json()
      
      if (settingsData.success && settingsData.data) {
        setSettings(settingsData.data)
        // Show announcement if enabled
        if (settingsData.data.announcementEnabled && settingsData.data.announcementText) {
          // Check if already dismissed
          const dismissed = localStorage.getItem('announcement_dismissed')
          const today = new Date().toDateString()
          if (dismissed !== today) {
            setShowAnnouncement(true)
          }
        }
      }
      
      // Show promo ads if any active
      if (promoData.success && promoData.data) {
        const activeAds = (promoData.data as PromoAd[]).filter(ad => ad.Aktif !== false)
        if (activeAds.length > 0) {
          setPromoAds(activeAds)
          // Check if already dismissed within 1 hour
          const promoDismissed = localStorage.getItem('promo_ad_dismissed')
          if (promoDismissed) {
            const dismissTime = new Date(promoDismissed)
            const now = new Date()
            if (dismissTime > now) {
              // Still within 1 hour, don't show
              return
            }
          }
          setShowPromoAd(true)
        }
      }
    } catch (err) {
      console.error('Error loading popup data:', err)
    } finally {
      setLoading(false)
    }
  }

  const closeAnnouncement = () => {
    setShowAnnouncement(false)
    // Remember for today
    localStorage.setItem('announcement_dismissed', new Date().toDateString())
  }

  const closePromoAd = () => {
    setShowPromoAd(false)
    // Remember for 1 hour
    const oneHourLater = new Date()
    oneHourLater.setHours(oneHourLater.getHours() + 1)
    localStorage.setItem('promo_ad_dismissed', oneHourLater.toISOString())
  }

  const nextPromo = () => {
    setCurrentPromoIndex((prev) => (prev + 1) % promoAds.length)
  }

  const prevPromo = () => {
    setCurrentPromoIndex((prev) => (prev - 1 + promoAds.length) % promoAds.length)
  }

  const handlePromoClick = () => {
    const currentAd = promoAds[currentPromoIndex]
    if (currentAd['URL Link']) {
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

      {/* Promo Ad Popup - Bottom position, not full screen */}
      {showPromoAd && promoAds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          {/* Backdrop for mobile */}
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={closePromoAd}
          ></div>
          
          {/* Content - Slides up from bottom on mobile */}
          <div className="relative bg-white rounded-t-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
            {/* Close button */}
            <button
              onClick={closePromoAd}
              className="absolute top-3 right-3 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image - Smaller aspect ratio for mobile */}
            <div 
              className="relative cursor-pointer"
              onClick={handlePromoClick}
            >
              <div className="aspect-[16/9] bg-gray-100 relative">
                {promoAds[currentPromoIndex]['URL Gambar'] ? (
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
                <div className="flex justify-center gap-1.5 pb-2">
                  {promoAds.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentPromoIndex(idx) }}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
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

      {/* Promo Ad Popup - Center position for desktop */}
      {showPromoAd && promoAds.length > 0 && (
        <div className="hidden md:block fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closePromoAd}
          ></div>
          
          {/* Content */}
          <div className="relative max-w-lg w-full">
            {/* Close button */}
            <button
              onClick={closePromoAd}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 flex items-center gap-2"
            >
              <span className="text-sm">Tutup</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image */}
            <div 
              className="relative bg-white rounded-2xl shadow-2xl overflow-hidden cursor-pointer hover:shadow-3xl transition-shadow"
              onClick={handlePromoClick}
            >
              <div className="aspect-[4/3] bg-gray-100 relative">
                {promoAds[currentPromoIndex]['URL Gambar'] ? (
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextPromo() }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Info */}
              {(promoAds[currentPromoIndex].Judul || promoAds[currentPromoIndex].Deskripsi) && (
                <div className="p-4 bg-white">
                  {promoAds[currentPromoIndex].Judul && (
                    <h3 className="font-bold text-gray-900">{promoAds[currentPromoIndex].Judul}</h3>
                  )}
                  {promoAds[currentPromoIndex].Deskripsi && (
                    <p className="text-sm text-gray-600 mt-1">{promoAds[currentPromoIndex].Deskripsi}</p>
                  )}
                </div>
              )}
              
              {/* Dots indicator */}
              {promoAds.length > 1 && (
                <div className="flex justify-center gap-2 pb-3">
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