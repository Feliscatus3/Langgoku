'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface Settings {
  maintenanceMode: boolean
}

const CACHE_TTL_MS = 60_000
let maintenanceCache: { at: number; enabled: boolean } | null = null

export default function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMaintenance, setIsMaintenance] = useState(false)

  useEffect(() => {
    // Skip check for admin pages, API routes, the maintenance page itself,
    // and asset requests.
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/maintenance') ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')
    ) {
      return
    }

    let active = true

    const checkMaintenance = async () => {
      try {
        if (maintenanceCache && Date.now() - maintenanceCache.at < CACHE_TTL_MS) {
          if (active && maintenanceCache.enabled) {
            setIsMaintenance(true)
            router.replace('/maintenance')
          }
          return
        }

        const response = await fetch(`/api/settings?_=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        })
        const data = await response.json()

        if (!active) return

        if (data.success && data.data) {
          const settings = data.data as Settings
          maintenanceCache = { at: Date.now(), enabled: Boolean(settings.maintenanceMode) }

          if (settings.maintenanceMode) {
            setIsMaintenance(true)
            router.replace('/maintenance')
            return
          }
        }

        setIsMaintenance(false)
      } catch (err) {
        console.error('Error checking maintenance mode:', err)
      }
    }

    void checkMaintenance()

    return () => {
      active = false
    }
  }, [pathname, router])

  // Only replace the page once maintenance has actually been confirmed.
  if (isMaintenance && pathname !== '/maintenance') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return <>{children}</>
}
