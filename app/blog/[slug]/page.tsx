'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import { BlogPost } from '@/types/blog'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch('/api/blog')
        const data = await response.json()

        if (data.success && data.data) {
          const allPosts: BlogPost[] = data.data
          const foundPost = allPosts.find((p: BlogPost) => p.slug === params.slug && p.published)

          if (foundPost) {
            setPost(foundPost)
            setRelatedPosts(
              allPosts
                .filter((p: BlogPost) => p.category === foundPost.category && p.id !== foundPost.id && p.published)
                .slice(0, 3)
            )
          }
        }
      } catch (err) {
        console.error('Error fetching blog post:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.slug])

  if (loading) return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </>
  )

  if (!post) return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <div className="container-custom py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-950 mb-4">Artikel Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Artikel yang Anda cari tidak ditemukan atau telah dihapus.</p>
          <Link href="/blog" className="btn-primary">
            Kembali ke Blog
          </Link>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        <article className="container-custom py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            {/* Article Header */}
            <div className="mb-8">
              <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
                Kembali ke Blog
              </Link>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-950 mb-4 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-8 border-b border-gray-200">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {post.category}
                </span>
                <span>Oleh <strong>{post.author}</strong></span>
                <span>{new Date(post.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span>{post.views} views</span>
              </div>
            </div>

            {/* Article Image */}
            {post.image && (
              <div className="mb-10 rounded-lg overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Article Footer */}
            <div className="border-y border-gray-200 py-8 mb-12">
              <p className="text-gray-600">
                <strong>Penulis:</strong> {post.author}
              </p>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="py-12 border-t border-gray-200">
                <h2 className="text-3xl font-bold text-gray-950 mb-8">Artikel Terkait</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map(relatedPost => (
                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                      <div className="card p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 group">
                        {relatedPost.image && (
                          <div className="mb-4 h-40 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-blue-600 uppercase">
                          {relatedPost.category}
                        </span>
                        <h3 className="font-bold text-gray-900 mt-2 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(relatedPost.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </>
  )
}
