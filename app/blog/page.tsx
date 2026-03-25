'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'

import { BlogPost } from '@/types/blog' // Create this if needed

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog')
      const data = await response.json()
      if (data.success && data.data) {
        setPosts(data.data.filter((post: BlogPost) => post.published))
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['Semua', ...new Set(posts.map(p => p.category))]
  const filteredPosts = selectedCategory === 'Semua' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container-custom py-12 md:py-20">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-950 to-slate-800 dark:from-white dark:to-slate-100 bg-clip-text text-transparent mb-6 leading-tight">
            Blog Langgoku
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Artikel, tips, dan tutorial terbaru tentang layanan premium digital
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center mb-16 gap-3 max-w-2xl mx-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg glass hover:shadow-xl transform hover:-translate-y-1 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-primary-500 to-blue-600 text-white ring-2 ring-primary-400/50'
                  : ''
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* Posts Grid */}
        {!loading && filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <div className="glass p-8 h-full hover:shadow-2xl transition-all duration-500 cursor-pointer rounded-3xl border-0 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  {post.image && (
                    <div className="mb-6 rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-glow-primary">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 text-emerald-700 dark:text-emerald-200 text-sm font-semibold mb-4 shadow-md">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                    </svg>
                    {post.category}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 group-hover:text-primary-500 transition-all duration-300 line-clamp-2 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 line-clamp-4 leading-relaxed text-lg">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm">
                      <img
                        src="/images/kader/default-avatar.jpg"
                        alt={post.author}
                        className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {post.author}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {post.views.toLocaleString()} views
                      </div>
                      <button className="mt-1 px-4 py-2 btn-secondary text-xs">
                        Baca Selengkapnya →
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-32">
            <div className="glass p-16 rounded-3xl shadow-2xl max-w-2xl mx-auto">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Belum Ada Artikel</h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
                Blog kami sedang dalam pengembangan. Segera hadir konten menarik dan bermanfaat!
              </p>
              <button className="btn-primary px-8 py-4 text-lg">
                Notifikasi Saat Update
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
