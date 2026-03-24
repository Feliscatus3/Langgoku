'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-gradient-primary/95 backdrop-blur-md sticky top-0 z-50 shadow-xl border-b border-primary-200">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-glow-accent transition-all duration-300 transform group-hover:scale-110">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-xl text-white tracking-tight">Langgoku</span>
              <span className="text-xs text-primary-100 font-medium">Premium Digital</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-white/80 hover:text-white font-medium transition-colors duration-300 relative group">
              Produk
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-accent rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-white/80 hover:text-white font-medium transition-colors duration-300 relative group">
              Tentang
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-accent rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/admin" className="text-white/80 hover:text-white font-medium transition-colors duration-300 relative group">
              Admin
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-accent rounded-full transition-all duration-300 group-hover:w-full"></span>
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
          <div className="md:hidden py-4 border-t border-primary-200/50 space-y-2">
            <Link href="/" className="block py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-colors duration-300 font-medium">
              Produk
            </Link>
            <Link href="/about" className="block py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-colors duration-300 font-medium">
              Tentang
            </Link>
            <Link href="/admin" className="block py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-colors duration-300 font-medium">
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
