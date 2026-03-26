// Support both local and Vercel environment variables
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

export async function getGoogleSheetsData() {
  try {
    if (!APPS_SCRIPT_URL) {
      console.warn('Google Apps Script URL not configured. Please set GOOGLE_APPS_SCRIPT_URL in Vercel project settings.')
      return []
    }

    const url = `${APPS_SCRIPT_URL}?action=getProducts`
    const response = await fetch(url, { next: { revalidate: 60 } })
    
    if (!response.ok) {
      console.error('Failed to fetch from Google Apps Script:', response.status)
      return []
    }

    const data = await response.json()
    
    if (!data.success) {
      console.warn('Google Apps Script returned error:', data.message)
      return []
    }

    return data.data || []
  } catch (error) {
    console.error('Error fetching Google Apps Script data:', error)
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
  try {
    if (!APPS_SCRIPT_URL) {
      throw new Error('Google Apps Script URL not configured. Please set GOOGLE_APPS_SCRIPT_URL in Vercel project settings.')
    }

    const url = `${APPS_SCRIPT_URL}?action=addProduct`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(product),
    })

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to add product')
    }

    return data
  } catch (error) {
    console.error('Error adding product:', error)
    throw error
  }
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
  try {
    if (!APPS_SCRIPT_URL) {
      throw new Error('Google Apps Script URL not configured. Please set GOOGLE_APPS_SCRIPT_URL in Vercel project settings.')
    }

    const url = `${APPS_SCRIPT_URL}?action=updateProduct`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(product),
    })

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to update product')
    }

    return data
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export async function deleteProductFromGoogleSheets(id: string) {
  try {
    if (!APPS_SCRIPT_URL) {
      throw new Error('Google Apps Script URL not configured. Please set GOOGLE_APPS_SCRIPT_URL in Vercel project settings.')
    }

    const url = `${APPS_SCRIPT_URL}?action=deleteProduct`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ id }),
    })

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete product')
    }

    return data
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

export function parsePrice(priceStr: any): number {
  if (typeof priceStr === 'number') return priceStr
  if (!priceStr) return 0

  // Remove all non-digit characters except the last 3 (for decimals if any)
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