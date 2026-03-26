import Link from 'next/link'
import ProductGrid from '@/components/ProductGrid'
import EmptyState from '@/components/EmptyState'
import { getGoogleSheetsData } from '@/lib/googleSheets'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type SearchParams = {
  category?: string | string[]
  sort?: string | string[]
  q?: string | string[]
}

type Product = {
  id: string
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  category?: string
}

function normalizeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

const KNOWN_CATEGORIES = [
  'Netflix',
  'Canva',
  'CapCut',
  'Spotify',
  'Disney+',
  'Zoom',
  'Gemini',
  'ChatGPT',
  'Alightmotion',
]

function inferCategoryFromName(name: string): string | null {
  const n = name.toLowerCase()
  for (const cat of KNOWN_CATEGORIES) {
    if (n.includes(cat.toLowerCase())) return cat
  }
  return null
}

function getProductCategory(product: Product): string {
  const raw = (product.category || '').trim()
  if (raw) return raw

  return inferCategoryFromName(product.name) || 'Lainnya'
}

export default async function ProductsPage({ searchParams }: { searchParams?: SearchParams }) {
  const products = (await getGoogleSheetsData()) as Product[]

  const selectedCategory = normalizeParam(searchParams?.category) || 'all'
  const selectedSort = normalizeParam(searchParams?.sort) || 'featured'
  const query = normalizeParam(searchParams?.q).trim()

  const categories = Array.from(
    new Set(products.map((p) => getProductCategory(p)).filter(Boolean))
  )

  const categoryList = (() => {
    const knownFirst = KNOWN_CATEGORIES.filter((c) => categories.includes(c))
    const rest = categories
      .filter((c) => !KNOWN_CATEGORIES.includes(c))
      .sort((a, b) => a.localeCompare(b))
    return ['Lainnya', ...knownFirst.filter((c) => c !== 'Lainnya'), ...rest.filter((c) => c !== 'Lainnya')]
  })().filter((c, idx, arr) => arr.indexOf(c) === idx)

  const normalizedCategory =
    selectedCategory === 'all' || !categories.includes(selectedCategory) ? 'all' : selectedCategory

  const filteredProducts = products
    .filter((p) => {
      if (normalizedCategory === 'all') return true
      return getProductCategory(p) === normalizedCategory
    })
    .filter((p) => {
      if (!query) return true
      const k = query.toLowerCase()
      return (
        p.name.toLowerCase().includes(k) ||
        p.duration.toLowerCase().includes(k) ||
        getProductCategory(p).toLowerCase().includes(k)
      )
    })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === 'price_asc') return a.price - b.price
    if (selectedSort === 'price_desc') return b.price - a.price

    // featured: stok lebih tinggi dulu, lalu harga lebih tinggi, lalu nama
    if (b.stock !== a.stock) return b.stock - a.stock
    if (b.price !== a.price) return b.price - a.price
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-16 md:py-24">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-blue-100 hover:text-white transition-colors mb-6"
            >
              ← Kembali ke Beranda
            </Link>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              Semua Produk Premium
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
              Produk akan update otomatis sesuai data terbaru.
            </p>
          </div>
        </div>
      </section>

      <section className="container-custom py-12 md:py-16">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Daftar Produk</h2>
              <p className="text-gray-600">
                Menampilkan <span className="font-semibold">{sortedProducts.length}</span> dari{' '}
                <span className="font-semibold">{products.length}</span> produk
                {query ? ` (pencarian "${query}")` : ''}
              </p>
            </div>
          </div>
        </div>

        <form
          method="GET"
          className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-4 md:p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2 md:space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Kategori</label>
              <select
                name="category"
                defaultValue={normalizedCategory}
                className="input-field"
              >
                <option value="all">Semua</option>
                {categoryList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Sort Harga</label>
              <select
                name="sort"
                defaultValue={selectedSort}
                className="input-field"
              >
                <option value="featured">Tersedia Terbaik</option>
                <option value="price_asc">Termurah</option>
                <option value="price_desc">Termahal</option>
              </select>
            </div>

            <div className="space-y-2 md:space-y-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Cari</label>
              <input
                name="q"
                type="text"
                defaultValue={query}
                placeholder="Cari produk..."
                className="input-field"
              />
            </div>

            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="btn-primary px-6 py-3 text-sm"
              >
                Terapkan
              </button>
            </div>
          </div>
        </form>

        {sortedProducts.length === 0 ? (
          <EmptyState
            title="Produk Tidak Ditemukan"
            description="Coba kategori atau kata kunci lain."
          />
        ) : (
          <ProductGrid products={sortedProducts} />
        )}
      </section>
    </div>
  )
}

