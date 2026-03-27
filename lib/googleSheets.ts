// Support both local and Vercel environment variables
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

// Column name mapping from Indonesian (Google Sheets) to English (App)
const COLUMN_MAP: { [key: string]: string } = {
  'ID': 'id',
  'Nama Produk': 'name',
  'Harga': 'price',
  'Durasi': 'duration',
  'Stok': 'stock',
  'Deskripsi': 'description',
  'Tanggal Dibuat': 'createdAt',
  'Gambar URL': 'image',
  // Buyer columns
  'Nama': 'name',
  'No WhatsApp': 'phone',
  'Produk': 'product',
  'Tanggal Mulai': 'startDate',
  'Tanggal Selesai': 'endDate',
  'Status': 'status',
  'Sisa Hari': 'remainingDays',
  'Metode Pembayaran': 'paymentMethod',
  'No Admin WhatsApp': 'adminPhone',
  'Tanggal Input': 'createdAt'
}

export async function getGoogleSheetsData() {
  try {
    if (!APPS_SCRIPT_URL) {
      console.error('[GoogleSheets] URL not configured.')
      return []
    }

    const url = `${APPS_SCRIPT_URL}?action=getProducts`
    const response = await fetch(url, { 
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(30000)
    })
    
    if (!response.ok) {
      console.error('[GoogleSheets] HTTP Error:', response.status)
      return []
    }

    const data = await response.json()
    
    if (!data.success) {
      console.warn('[GoogleSheets] API Error:', data.message)
      return []
    }

    // Map column names from Indonesian to English
    const mappedData = (data.data || []).map((item: any) => mapColumnNames(item))
    
    console.log('[GoogleSheets] Products fetched:', mappedData.length)
    return mappedData
  } catch (error) {
    console.error('[GoogleSheets] Fetch error:', error)
    return []
  }
}

function mapColumnNames(item: any): any {
  const mapped: any = {}
  for (const key in item) {
    const englishKey = COLUMN_MAP[key] || key
    let value = item[key]
    
    // Parse numeric fields
    if (englishKey === 'price' || englishKey === 'stock') {
      value = parseNumber(value)
    }
    
    mapped[englishKey] = value
  }
  return mapped
}

function parseNumber(value: any): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  const cleaned = String(value).replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

export async function addProductToGoogleSheets(product: {
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  description?: string
}) {
  if (!APPS_SCRIPT_URL) {
    throw new Error('GOOGLE_APPS_SCRIPT_URL not configured')
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'addProduct',
      ...product
    }),
    signal: AbortSignal.timeout(30000)
  })

  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to add product')
  }

  return data
}

export async function updateProductInGoogleSheets(product: {
  id: string
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  description?: string
}) {
  if (!APPS_SCRIPT_URL) {
    throw new Error('GOOGLE_APPS_SCRIPT_URL not configured')
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'updateProduct',
      ...product
    }),
    signal: AbortSignal.timeout(30000)
  })

  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to update product')
  }

  return data
}

export async function deleteProductFromGoogleSheets(id: string) {
  if (!APPS_SCRIPT_URL) {
    throw new Error('GOOGLE_APPS_SCRIPT_URL not configured')
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'deleteProduct',
      id
    }),
    signal: AbortSignal.timeout(30000)
  })

  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete product')
  }

  return data
}

export function parsePrice(priceStr: any): number {
  return parseNumber(priceStr)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

export function generateUniqueCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function calculateExpiryDate(duration: string): Date {
  const date = new Date()
  const months = parseInt(duration.match(/\d+/)?.[0] || '1')
  date.setMonth(date.getMonth() + months)
  return date
}

export function calculateRemainingDays(expiryDate: Date): number {
  const today = new Date()
  const diffTime = expiryDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getSubscriptionStatus(remainingDays: number): 'active' | 'expiring' | 'expired' {
  if (remainingDays <= 0) return 'expired'
  if (remainingDays <= 3) return 'expiring'
  return 'active'
}