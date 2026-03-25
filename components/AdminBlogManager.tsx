'use client'

import { useState, useEffect } from 'react'
import { BlogPost } from '@/types/blog'

const categories = ['Tips & Trik', 'Tutorial', 'Berita', 'Review', 'Lainnya']

export default function AdminBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
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

  const handleAddPost = async () => {
    if (!formData.title || !formData.content) {
      alert('Harap isi title dan konten')
      return
    }

    try {
      if (editingId) {
        const newPosts = posts.map(p =>
          p.id === editingId ? { ...p, ...formData } as BlogPost : p
        )
        setPosts(newPosts)
        alert('Blog post berhasil diperbarui')
      } else {
        const newPost: BlogPost = {
          id: Date.now().toString(),
          title: formData.title || '',
          slug: formData.slug || generateSlug(formData.title || ''),
          excerpt: formData.excerpt || '',
          content: formData.content || '',
          image: formData.image,
          author: formData.author || 'Admin',
          category: formData.category || 'Umum',
          publishedAt: formData.publishedAt || new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        }
        setPosts([newPost, ...posts])
        alert('Blog post berhasil ditambahkan')
      }
      resetForm()
    } catch (err) {
      console.error('Error saving post:', err)
      alert('Error saving post')
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setFormData(post)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus blog post ini?')) {
      setPosts(posts.filter(p => p.id !== id))
      alert('Blog post berhasil dihapus')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      image: '',
      category: 'Tips & Trik',
      author: '',
      publishedAt: new Date().toISOString().split('T')[0],
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-blue-600 font-medium">Memuat blog posts...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-950 mb-1">Manajemen Blog</h2>
          <p className="text-gray-600 text-sm">Buat dan kelola artikel blog</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary whitespace-nowrap">
            + Artikel Baru
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-8 mb-8 shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-950 mb-6">
            {editingId ? 'Edit Artikel' : 'Buat Artikel Baru'}
          </h3>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Artikel *
              </label>
              <input
                type="text"
                placeholder="Masukkan judul artikel..."
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
                className="input-field w-full text-lg"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug (Auto-generated)
              </label>
              <input
                type="text"
                value={formData.slug || ''}
                disabled
                className="input-field w-full bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  value={formData.category || 'Tips & Trik'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field w-full"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penulis *
                </label>
                <input
                  type="text"
                  placeholder="Nama penulis"
                  value={formData.author || ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Publikasi
                </label>
                <input
                  type="date"
                  value={(formData.publishedAt || '').split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ringkasan (Excerpt)
              </label>
              <textarea
                placeholder="Ringkasan artikel untuk preview..."
                value={formData.excerpt || ''}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="input-field w-full"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Utama
              </label>
              <input
                type="text"
                placeholder="http://... atau /images/foto/..."
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="input-field w-full"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten *
              </label>
              <textarea
                placeholder="Tulis konten artikel lengkap di sini..."
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="input-field w-full font-mono text-sm"
              />
              <p className="text-gray-500 text-xs mt-1">
                Gunakan HTML atau plain text, contoh: &lt;h2&gt;Subheading&lt;/h2&gt;, &lt;p&gt;Paragraph&lt;/p&gt;, &lt;strong&gt;Bold&lt;/strong&gt;
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button onClick={handleAddPost} className="btn-primary flex-1">
                {editingId ? 'Update Artikel' : 'Publikasikan'}
              </button>
              <button onClick={resetForm} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">Belum ada artikel blog</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Buat Artikel Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-950 mb-2">{post.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-600 mb-2">
                    <span>{post.category}</span>
                    <span>Oleh: {post.author}</span>
                    <span>{post.publishedAt}</span>
                  </div>
                  {post.excerpt && <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>}
                </div>
                {post.image && (
                  <img src={post.image} alt={post.title} className="w-20 h-20 object-cover rounded ml-4" />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
