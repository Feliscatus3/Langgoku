'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-slate-800 dark:to-slate-900 sticky top-0 z-50 shadow-xl border-b border-blue-700 dark:border-slate-700">
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
              Produk
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-white/90 hover:text-white font-medium transition-colors duration-300 relative group">
              Tentang
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/blog" className="text-white/90 hover:text-white font-medium transition-colors duration-300 relative group">
              Blog
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/admin" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 transform">
              Panel Admin
            </Link>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-slate-200/20 transition-colors ml-4"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              {darkMode ? (
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1z" clipRule="evenodd" />
              ) : (
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              )}
            </svg>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-white/20 dark:hover:bg-slate-200/20 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
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
          <div className="md:hidden py-4 border-t border-blue-500 dark:border-slate-500 space-y-2 bg-blue-700 dark:bg-slate-800">
            <Link href="/" className="block py-3 px-4 text-white hover:bg-white/10 dark:hover:bg-slate-200/10 rounded-lg transition-colors duration-300 font-medium">
              Produk
            </Link>
            <Link href="/about" className="block py-3 px-4 text-white hover:bg-white/10 dark:hover:bg-slate-200/10 rounded-lg transition-colors duration-300 font-medium">
              Tentang
            </Link>
            <Link href="/blog" className="block py-3 px-4 text-white hover:bg-white/10 dark:hover:bg-slate-200/10 rounded-lg transition-colors duration-300 font-medium">
              Blog
            </Link>
            <Link href="/admin" className="block py-3 px-4 text-white hover:bg-amber-500 rounded-lg transition-colors duration-300 font-medium bg-blue-600 dark:bg-slate-600">
              Panel Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
