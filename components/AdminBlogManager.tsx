'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  image?: string
  category: string
  author: string
  publishedAt: string
  createdAt?: string
}

const categories = ['Tips & Trik', 'Tutorial', 'Berita', 'Review', 'Lainnya']

export default function AdminBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image: '',
    category: 'Tips & Trik',
    author: '',
    publishedAt: new Date().toISOString().split('T')[0],
  })

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  }

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'blockquote',
    'code-block',
    'link',
    'image',
  ]

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog')
      const data = await response.json()
      if (data.success && data.data) {
        setPosts(data.data)
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleAddPost = () => {
    if (!formData.title || !formData.content) {
      alert('Harap isi title dan konten')
      return
    }

    if (editingId) {
      const updatedPosts = posts.map(p =>
        p.id === editingId
          ? {
              ...p,
              ...formData,
              updatedAt: new Date().toISOString()
            } as BlogPost
          : p
      )
      setPosts(updatedPosts)
      alert('Blog post berhasil diperbarui')
    } else {
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: formData.title || '',
        slug: formData.slug || generateSlug(formData.title || ''),
        excerpt: formData.excerpt || '',
        content: formData.content || '',
        image: formData.image || '',
        author: formData.author || 'Admin',
        category: formData.category || 'Umum',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: formData.published || false,
        views: 0
      }
      setPosts([newPost, ...posts])
      alert('Blog post berhasil ditambahkan')
    }

    resetForm()
  }

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setFormData(post)
    setShowForm(true)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus blog post ini?')) {
      setPosts(posts.filter(p => p.id !== id))
      alert('Blog post berhasil dihapus')
    }
  }

  const handlePublish = (post: BlogPost) => {
    const updatedPosts = posts.map(p =>
      p.id === post.id
        ? { ...p, published: !p.published }
        : p
    )
    setPosts(updatedPosts)
  }

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      author: 'Admin',
      category: 'Umum',
      published: false
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-blue-600 font-medium">Memuat blog posts...</div>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-950 mb-1">Manajemen Blog</h2>
          <p className="text-gray-600 text-sm">Buat dan kelola artikel blog Anda</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary whitespace-nowrap"
          >
            + Buat Blog Post
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-8 mb-8 shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-950 mb-6">
            {editingId ? 'Edit Blog Post' : 'Buat Blog Post Baru'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul *
                </label>
                <input
                  type="text"
                  placeholder="Judul blog post"
                  value={formData.title || ''}
                  onChange={(e) => {
                    const title = e.target.value
                    setFormData({
                      ...formData,
                      title,
                      slug: formData.slug || generateSlug(title)
                    })
                  }}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="blog-post-slug"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={formData.category || 'Umum'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="Umum">Umum</option>
                  <option value="Tips">Tips</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Berita">Berita</option>
                  <option value="Review">Review</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penulis
                </label>
                <input
                  type="text"
                  placeholder="Nama penulis"
                  value={formData.author || ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ringkasan
              </label>
              <textarea
                placeholder="Ringkasan singkat dari blog post"
                value={formData.excerpt || ''}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Gambar
              </label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten *
              </label>
              <ReactQuill
                ref={quillRef}
                value={formData.content || ''}
                onChange={(value) => setFormData({ ...formData, content: value })}
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
                placeholder="Tulis konten blog post Anda di sini..."
                className="bg-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="published"
                checked={formData.published || false}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="published" className="text-sm font-medium text-gray-700">
                Publikasikan blog post
              </label>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleAddPost}
                className="btn-primary flex-1"
              >
                {editingId ? 'Update Post' : 'Buat Post'}
              </button>
              <button
                onClick={resetForm}
                className="btn-secondary flex-1"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-16 card p-8 border border-gray-200">
          <p className="text-gray-600 text-lg font-medium">Belum ada blog post</p>
          <p className="text-gray-500 text-sm mt-2">Klik tombol "Buat Blog Post" untuk membuat post pertama Anda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="card p-6 hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{post.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      post.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.published ? 'Dipublikasikan' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span>
                    <span>Oleh {post.author}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('id-ID')}</span>
                    <span>{post.views} views</span>
                  </div>
                </div>
                <div className="flex gap-2 md:flex-col">
                  <button
                    onClick={() => handleEdit(post)}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePublish(post)}
                    className={`text-sm py-2 px-4 rounded border font-medium transition-colors ${
                      post.published
                        ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {post.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="btn-secondary text-sm py-2 px-4 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
