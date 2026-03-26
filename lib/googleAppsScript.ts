/**
 * Google Apps Script Client Library
 * Menghubungkan Next.js API routes ke Google Apps Script Web App
 * untuk CRUD operations ke Google Sheets
 */

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || ''

interface AppsScriptResponse {
  success: boolean
  message?: string
  data?: any
  count?: number
}

/**
 * Generic caller untuk Google Apps Script Web App
 */
async function callAppsScript(
  action: string,
  method: 'GET' | 'POST',
  payload?: any
): Promise<AppsScriptResponse> {
  if (!APPS_SCRIPT_URL) {
    throw new Error('GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi di .env.local')
  }

  try {
    if (method === 'GET') {
      const url = `${APPS_SCRIPT_URL}?action=${action}${payload?.id ? `&id=${payload.id}` : ''}`
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } else {
      // POST request
      const url = `${APPS_SCRIPT_URL}?action=${action}`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload || {}),
        redirect: 'follow',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    }
  } catch (error) {
    console.error(`Error calling Apps Script (${action}):`, error)
    throw error
  }
}

// ==============================
// PRODUCT FUNCTIONS
// ==============================

export async function getProductsFromSheet(): Promise<AppsScriptResponse> {
  return callAppsScript('getProducts', 'GET')
}

export async function getProductFromSheet(id: string): Promise<AppsScriptResponse> {
  return callAppsScript('getProduct', 'GET', { id })
}

export async function addProductToSheet(product: {
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  description?: string
}): Promise<AppsScriptResponse> {
  return callAppsScript('addProduct', 'POST', product)
}

export async function updateProductInSheet(product: {
  id: string
  name: string
  price: number
  duration: string
  stock: number
  image?: string
  description?: string
}): Promise<AppsScriptResponse> {
  return callAppsScript('updateProduct', 'POST', product)
}

export async function deleteProductFromSheet(id: string): Promise<AppsScriptResponse> {
  return callAppsScript('deleteProduct', 'POST', { id })
}

// ==============================
// BUYER FUNCTIONS
// ==============================

export async function getBuyersFromSheet(): Promise<AppsScriptResponse> {
  return callAppsScript('getBuyers', 'GET')
}

export async function getBuyerFromSheet(id: string): Promise<AppsScriptResponse> {
  return callAppsScript('getBuyer', 'GET', { id })
}

export async function addBuyerToSheet(buyer: {
  name: string
  phone: string
  product: string
  duration: string
  startDate: string
  endDate: string
}): Promise<AppsScriptResponse> {
  return callAppsScript('addBuyer', 'POST', buyer)
}

export async function updateBuyerInSheet(buyer: {
  id: string
  name: string
  phone: string
  product: string
  duration: string
  startDate: string
  endDate: string
}): Promise<AppsScriptResponse> {
  return callAppsScript('updateBuyer', 'POST', buyer)
}

export async function deleteBuyerFromSheet(id: string): Promise<AppsScriptResponse> {
  return callAppsScript('deleteBuyer', 'POST', { id })
}

// ==============================
// STATS FUNCTION
// ==============================

export async function getStatsFromSheet(): Promise<AppsScriptResponse> {
  return callAppsScript('getStats', 'GET')
}
