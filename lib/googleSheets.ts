export async function getGoogleSheetsData() {
  try {
    const sheetsUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

    if (!sheetsUrl || !apiKey) {
      console.warn('Google Sheets credentials not configured')
      return []
    }

    // Menggunakan Google Sheets API v4
    // Format: https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}?key={apiKey}
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsUrl}/values/Products!A2:G1000?key=${apiKey}`

    const response = await fetch(url)
    
    if (!response.ok) {
      console.error('Failed to fetch from Google Sheets:', response.status)
      return []
    }

    const data = await response.json()
    
    if (!data.values || data.values.length === 0) {
      console.warn('No data found in Google Sheets')
      return []
    }

    // Transform data from Google Sheets format to Product format
    const products = data.values.map((row: any[], index: number) => ({
      id: row[0] || `product-${index}`,
      name: row[1] || 'Unknown',
      price: parsePrice(row[2]) || 0,
      duration: row[3] || '1 bulan',
      stock: parseInt(row[4]) || 0,
      image: row[5] || '',
      description: row[6] || '',
    })).filter((p: any) => p.name && p.price > 0)

    return products
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error)
    return []
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
