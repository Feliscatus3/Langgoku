'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  author: string
  category: string
  createdAt: string
  published: boolean
  views: number
}

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
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="container-custom py-12 md:py-20">
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-950 mb-4">Blog Langgoku</h1>
            <p className="text-gray-600 text-lg">
              Artikel, tips, dan tutorial terbaru tentang layanan premium digital
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-12 flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && <LoadingSpinner />}

          {/* Posts Grid */}
          {!loading && filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <div className="card p-6 h-full hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 group">
                    {post.image && (
                      <div className="mb-4 h-40 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {post.category}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-2 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                        <span>{post.author}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg font-medium">Belum ada artikel blog</p>
              <p className="text-gray-500 text-sm mt-2">Kami akan segera mempublikasikan artikel menarik untuk Anda</p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}
