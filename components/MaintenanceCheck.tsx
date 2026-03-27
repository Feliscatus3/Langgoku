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
    // Skip check for admin pages and API routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/maintenance')) {
      setIsChecking(false)
      return
    }

    const checkMaintenance = async () => {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        
        if (data.success && data.data) {
          const settings = data.data as Settings
          if (settings.maintenanceMode) {
            setIsMaintenance(true)
            router.push('/maintenance')
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

  if (isMaintenance) {
    return null
  }

  return <>{children}</>
}