'use client'

import { useState } from 'react'

interface AdminLoginProps {
  onLogin: (success: boolean) => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Login gagal')
        onLogin(false)
        return
      }

      // Confirm the httpOnly session cookie was actually stored. This catches
      // browsers blocking cookies and HTTP/LAN access where Secure cookies are
      // rejected, instead of silently showing the dashboard.
      const sessionResponse = await fetch('/api/admin/login', { cache: 'no-store' })
      const session = await sessionResponse.json()

      if (!session.authenticated) {
        setError(
          'Login berhasil, tetapi cookie sesi tidak tersimpan. Buka lewat http://localhost:3000 (bukan IP LAN) dan izinkan cookie di browser.'
        )
        onLogin(false)
        return
      }

      onLogin(true)
    } catch (err) {
      console.error('Login error:', err)
      setError('Terjadi kesalahan saat login')
      onLogin(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 card p-8 border border-gray-300 shadow-2xl">
        <div>
          <h2 className="text-4xl font-bold text-center text-gradient mb-3">
            Admin Panel
          </h2>
          <p className="text-center text-gray-700 font-medium">
            Masukkan kredensial admin Anda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="adminku"
              autoComplete="username"
              className="input-field w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="input-field w-full"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="btn-primary w-full py-3 text-lg font-semibold mt-6"
          >
            {loading ? '⏳ Loading...' : '→ Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
