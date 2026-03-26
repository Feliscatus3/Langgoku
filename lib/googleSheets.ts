// Support both local and Vercel environment variables
// For Vercel, use NEXT_PUBLIC_ prefix to expose to client-side
// For server-side, use GOOGLE_APPS_SCRIPT_URL (server-only)
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

// Debug log in development
if (process.env.NODE_ENV === 'development') {
  console.log('[GoogleSheets] APPS_SCRIPT_URL:', APPS_SCRIPT_URL ? 'SET' : 'NOT SET')
}

export async function getGoogleSheetsData() {
  try {
    if (!APPS_SCRIPT_URL) {
      console.error('[GoogleSheets] URL not configured. Set GOOGLE_APPS_SCRIPT_URL in Vercel Environment Variables.')
      return []
    }

    console.log('[GoogleSheets] Fetching from:', `${APPS_SCRIPT_URL}?action=getProducts`)
    
    const url = `${APPS_SCRIPT_URL}?action=getProducts`
    const response = await fetch(url, { 
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })
    
    if (!response.ok) {
      console.error('[GoogleSheets] HTTP Error:', response.status, response.statusText)
      return []
    }

    const data = await response.json()
    
    if (!data.success) {
      console.warn('[GoogleSheets] API Error:', data.message)
      return []
    }

    console.log('[GoogleSheets] Products fetched:', data.data?.length || 0)
    return data.data || []
  } catch (error) {
    console.error('[GoogleSheets] Fetch error:', error)
    return []
  }
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
    throw new Error('GOOGLE_APPS_SCRIPT_URL not configured in Vercel Environment Variables')
  }

  console.log('[GoogleSheets] Adding product:', product.name)
  
  const url = `${APPS_SCRIPT_URL}?action=addProduct`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(product),
    signal: AbortSignal.timeout(30000)
  })

  const data = await response.json()
  
  if (!data.success) {
    console.error('[GoogleSheets] Add product error:', data.message)
    throw new Error(data.message || 'Failed to add product')
  }

  console.log('[GoogleSheets] Product added successfully:', data.data)
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
    throw new Error('GOOGLE_APPS_SCRIPT_URL not configured in Vercel Environment Variables')
  }

  const url = `${APPS_SCRIPT_URL}?action=updateProduct`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(product),
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
    throw new Error('GOOGLE_APPS_SCRIPT_URL not configured in Vercel Environment Variables')
  }

  const url = `${APPS_SCRIPT_URL}?action=deleteProduct`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({ id }),
    signal: AbortSignal.timeout(30000)
  })

  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to delete product')
  }

  return data
}

export function parsePrice(priceStr: any): number {
  if (typeof priceStr === 'number') return priceStr
  if (!priceStr) return 0

  const cleaned = String(priceStr).replace(/[^\d]/g, '')
  return parseInt(cleaned, 10) || 0
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