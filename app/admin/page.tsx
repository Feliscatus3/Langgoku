'use client'

import { useEffect, useState } from 'react'
import AdminDashboard from '@/components/AdminDashboard'
import AdminLogin from '@/components/AdminLogin'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/login', { cache: 'no-store' })
        const data = await response.json()
        if (active) setIsAuthenticated(Boolean(data.authenticated))
      } catch (error) {
        console.error('Error checking admin session:', error)
        if (active) setIsAuthenticated(false)
      } finally {
        if (active) setLoading(false)
      }
    }

    void checkSession()
    return () => {
      active = false
    }
  }, [])

  const handleLogin = (success: boolean) => {
    setIsAuthenticated(success)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' })
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsAuthenticated(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-primary/20 blur-xl animate-pulse"></div>
              <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 shadow-glow-primary"></div>
            </div>
          </div>
          <p className="text-primary-600 font-medium text-lg">Memuat admin panel...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <AdminLogin onLogin={handleLogin} />
  )
}
