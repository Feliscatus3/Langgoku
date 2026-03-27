'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface Settings {
  maintenanceMode: boolean
}

export default function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isMaintenance, setIsMaintenance] = useState(false)

  useEffect(() => {
    // Skip check for admin pages and API routes and maintenance page itself
    if (
      pathname.startsWith('/admin') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/maintenance') ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')
    ) {
      setIsChecking(false)
      return
    }

    const checkMaintenance = async () => {
      try {
        // Add timestamp to avoid caching
        const response = await fetch(`/api/settings?_=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        const data = await response.json()
        
        console.log('Maintenance check:', data)
        
        if (data.success && data.data) {
          const settings = data.data as Settings
          if (settings.maintenanceMode) {
            console.log('Maintenance mode is ON, redirecting...')
            setIsMaintenance(true)
            // Use replace to avoid history stack issues
            if (pathname !== '/maintenance') {
              router.replace('/maintenance')
            }
          } else {
            setIsMaintenance(false)
          }
        }
      } catch (err) {
        console.error('Error checking maintenance mode:', err)
      } finally {
        setIsChecking(false)
      }
    }

    checkMaintenance()
  }, [pathname, router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // If maintenance mode is active and we're not on maintenance page
  if (isMaintenance && pathname !== '/maintenance') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return <>{children}</>
}