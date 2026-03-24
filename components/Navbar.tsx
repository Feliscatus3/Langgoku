'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 sticky top-0 z-50 shadow-xl border-b border-blue-700">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
              <span className="text-white font-bold text-lg md:text-xl">L</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-xl md:text-2xl text-white tracking-tight">Langgoku</span>
              <span className="text-xs md:text-sm text-blue-100 font-medium">Premium Digital</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            <Link href="/" className="text-white/90 hover:text-white font-medium transition-colors duration-300 relative group">
              🏠 Produk
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-white/90 hover:text-white font-medium transition-colors duration-300 relative group">
              ℹ️ Tentang
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/admin" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 transform">
              🔐 Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors duration-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-blue-500 space-y-2 bg-blue-700">
            <Link href="/" className="block py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-colors duration-300 font-medium">
              🏠 Produk
            </Link>
            <Link href="/about" className="block py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-colors duration-300 font-medium">
              ℹ️ Tentang
            </Link>
            <Link href="/admin" className="block py-3 px-4 text-white hover:bg-amber-500 rounded-lg transition-colors duration-300 font-medium bg-blue-600">
              🔐 Admin Panel
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
