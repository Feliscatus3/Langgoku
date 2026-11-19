import 'server-only'

import { appsScriptGet, appsScriptPost, isAppsScriptConfigured } from './appsScriptClient'
import { parseNumber } from './format'
import type {
  AttributeOption,
  Product,
  VariantAttribute,
  VariantCombination,
} from '@/types/product'

// Re-export client-safe helpers for backwards compatibility with server code.
export { formatPrice } from './format'
export { parseNumber as parsePrice } from './format'
export { generateUniqueCode } from './checkout'
export {
  calculateExpiryDate,
  calculateRemainingDays,
  getSubscriptionStatus,
} from './format'

const JSON_FIELDS = new Set(['attributes', 'options', 'combinations'])

// Column name mapping from Indonesian (Google Sheets) to English (App).
// Keep this list in sync with google-apps-script-updated.gs headers.
const COLUMN_MAP: Record<string, string> = {
  ID: 'id',
  'Nama Produk': 'name',
  'Nama Atribut': 'name',
  'Nama Opsi': 'name',
  Nama: 'name',
  Harga: 'price',
  Durasi: 'duration',
  Stok: 'stock',
  Deskripsi: 'description',
  'Tanggal Dibuat': 'createdAt',
  'Gambar URL': 'image',
  Atribut: 'attributes',
  Opsi: 'options',
  'Opsi (JSON)': 'options',
  Kombinasi: 'combinations',
  'Product ID': 'productId',
  'Attribute ID': 'attributeId',
  Urutan: 'sortOrder',
  Status: 'status',
  'No WhatsApp': 'phone',
  Produk: 'product',
  'Tanggal Mulai': 'startDate',
  'Tanggal Selesai': 'endDate',
  'Sisa Hari': 'remainingDays',
  'Metode Pembayaran': 'paymentMethod',
  'No Admin WhatsApp': 'adminPhone',
  'Tanggal Input': 'createdAt',
  'Notified At': 'notificationSentAt',
  Notified: 'notified',
  'Kombinasi ID': 'combinationId',
  Varian: 'variantName',
}

const NUMERIC_FIELDS = new Set(['price', 'stock', 'sortOrder', 'remainingDays'])

function normalizeStatus(value: unknown): 'active' | 'inactive' | unknown {
  if (typeof value === 'boolean') return value ? 'active' : 'inactive'
  if (typeof value === 'number') return value === 1 ? 'active' : 'inactive'

  const text = String(value ?? '').trim().toLowerCase()
  if (['active', 'aktif', 'true', '1', 'yes', 'ya'].includes(text)) return 'active'
  if (['inactive', 'nonaktif', 'non-aktif', 'tidak aktif', 'false', '0', 'no', 'tidak'].includes(text)) {
    return 'inactive'
  }
  return value
}

function parseJsonField(key: string, value: unknown): unknown {
  if (!JSON_FIELDS.has(key) || typeof value !== 'string') return value

  try {
    return JSON.parse(value)
  } catch {
    return key === 'options' ? {} : []
  }
}

/** Maps a raw Google Sheets row into the app's English key names. */
export function mapColumnNames(item: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {}

  for (const [key, rawValue] of Object.entries(item || {})) {
    const englishKey = COLUMN_MAP[key] || key
    let value: unknown = rawValue

    if (NUMERIC_FIELDS.has(englishKey)) {
      value = parseNumber(value)
    } else if (englishKey === 'status') {
      value = normalizeStatus(value)
    } else {
      value = parseJsonField(englishKey, value)
    }

    mapped[englishKey] = value
  }

  return mapped
}

function mapVariantAttribute(item: Record<string, unknown>): VariantAttribute {
  const mapped = mapColumnNames(item)
  return {
    id: String(mapped.id || ''),
    productId: String(mapped.productId || ''),
    name: String(mapped.name || ''),
    sortOrder: parseNumber(mapped.sortOrder),
    status: mapped.status === 'inactive' ? 'inactive' : 'active',
  }
}

function mapAttributeOption(item: Record<string, unknown>): AttributeOption {
  const mapped = mapColumnNames(item)
  return {
    id: String(mapped.id || ''),
    attributeId: String(mapped.attributeId || ''),
    name: String(mapped.name || ''),
    sortOrder: parseNumber(mapped.sortOrder),
    status: mapped.status === 'inactive' ? 'inactive' : 'active',
  }
}

function mapVariantCombination(item: Record<string, unknown>): VariantCombination {
  const mapped = mapColumnNames(item)
  const options =
    mapped.options && typeof mapped.options === 'object' && !Array.isArray(mapped.options)
      ? (mapped.options as Record<string, string>)
      : {}

  return {
    id: String(mapped.id || ''),
    productId: String(mapped.productId || ''),
    price: parseNumber(mapped.price),
    status: mapped.status === 'inactive' ? 'inactive' : 'active',
    stock: parseNumber(mapped.stock),
    sortOrder: parseNumber(mapped.sortOrder),
    options,
  }
}

function mapProduct(item: Record<string, unknown>): Product {
  const mapped = mapColumnNames(item)

  const variantAttributes = Array.isArray(mapped.attributes)
    ? mapped.attributes
        .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
        .map(mapVariantAttribute)
    : []

  const attributeOptions = Array.isArray(mapped.options)
    ? mapped.options
        .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
        .map(mapAttributeOption)
    : []

  const variantCombinations = Array.isArray(mapped.combinations)
    ? mapped.combinations
        .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
        .map(mapVariantCombination)
    : []

  return {
    id: String(mapped.id || ''),
    name: String(mapped.name || ''),
    price: parseNumber(mapped.price),
    duration: String(mapped.duration || ''),
    stock: parseNumber(mapped.stock),
    image: mapped.image ? String(mapped.image) : undefined,
    description: mapped.description ? String(mapped.description) : undefined,
    createdAt: mapped.createdAt ? String(mapped.createdAt) : undefined,
    variantAttributes,
    attributeOptions,
    variantCombinations,
  }
}

function sortByOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}

export interface ProductVariantData {
  variantAttributes: VariantAttribute[]
  attributeOptions: AttributeOption[]
  variantCombinations: VariantCombination[]
}

const EMPTY_VARIANT_DATA: ProductVariantData = {
  variantAttributes: [],
  attributeOptions: [],
  variantCombinations: [],
}

export async function getGoogleSheetsData(options: { noCache?: boolean } = {}): Promise<Product[]> {
  if (!isAppsScriptConfigured()) {
    console.error('[GoogleSheets] GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi')
    return []
  }

  try {
    const data = await appsScriptGet<Record<string, unknown>[]>(
      'getProducts',
      {},
      { revalidate: options.noCache ? 0 : 60 }
    )

    if (!data.success) {
      console.warn('[GoogleSheets] Gagal mengambil produk:', data.message)
      return []
    }

    return (data.data || [])
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map(mapProduct)
      .filter((product) => product.id.length > 0)
  } catch (error) {
    console.error('[GoogleSheets] Fetch products error:', error)
    return []
  }
}

export async function getVariantAttributes(productId: string): Promise<VariantAttribute[]> {
  if (!isAppsScriptConfigured() || !productId) return []

  try {
    const data = await appsScriptGet<Record<string, unknown>[]>(
      'getVariantAttributes',
      { productId },
      { revalidate: 60 }
    )
    if (!data.success) return []
    return sortByOrder(
      (data.data || [])
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
        .map(mapVariantAttribute)
        .filter((item) => item.id)
    )
  } catch (error) {
    console.error('[GoogleSheets] Fetch variant attributes error:', error)
    return []
  }
}

export async function getAttributeOptions(attributeId: string): Promise<AttributeOption[]> {
  if (!isAppsScriptConfigured() || !attributeId) return []

  try {
    const data = await appsScriptGet<Record<string, unknown>[]>(
      'getAttributeOptions',
      { attributeId },
      { revalidate: 60 }
    )
    if (!data.success) return []
    return sortByOrder(
      (data.data || [])
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
        .map(mapAttributeOption)
        .filter((item) => item.id)
    )
  } catch (error) {
    console.error('[GoogleSheets] Fetch attribute options error:', error)
    return []
  }
}

export async function getVariantCombinations(productId: string): Promise<VariantCombination[]> {
  if (!isAppsScriptConfigured() || !productId) return []

  try {
    const data = await appsScriptGet<Record<string, unknown>[]>(
      'getVariantCombinations',
      { productId },
      { revalidate: 60 }
    )
    if (!data.success) return []
    return sortByOrder(
      (data.data || [])
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
        .map(mapVariantCombination)
        .filter((item) => item.id)
    )
  } catch (error) {
    console.error('[GoogleSheets] Fetch variant combinations error:', error)
    return []
  }
}

// ---------------------------------------------------------------------------
// Bulk variant loading
// ---------------------------------------------------------------------------
// One Apps Script call for every product is far cheaper than 3+ calls per
// product. If the deployed script predates `getAllVariantData`, we fall back to
// the per-product endpoints automatically.

let bulkVariantSupport: boolean | null = null
let bulkVariantCache: { at: number; data: ProductVariantData } | null = null
const BULK_CACHE_TTL = 60_000

function invalidateVariantCache(): void {
  bulkVariantCache = null
}

async function getAllVariantData(force = false): Promise<ProductVariantData | null> {
  if (!isAppsScriptConfigured()) return null
  if (bulkVariantSupport === false && !force) return null

  const now = Date.now()
  if (!force && bulkVariantCache && now - bulkVariantCache.at < BULK_CACHE_TTL) {
    return bulkVariantCache.data
  }

  try {
    const response = await appsScriptGet<{
      attributes?: Record<string, unknown>[]
      options?: Record<string, unknown>[]
      combinations?: Record<string, unknown>[]
    }>('getAllVariantData', {}, { revalidate: force ? 0 : 60 })

    if (!response.success || !response.data) {
      if (String(response.message || '').toLowerCase().includes('tidak dikenali')) {
        bulkVariantSupport = false
      }
      return null
    }

    bulkVariantSupport = true
    const attributes = (response.data.attributes || []).map(mapVariantAttribute).filter((item) => item.id)
    const options = (response.data.options || []).map(mapAttributeOption).filter((item) => item.id)
    const combinations = (response.data.combinations || [])
      .map(mapVariantCombination)
      .filter((item) => item.id)

    const data: ProductVariantData = {
      variantAttributes: attributes,
      attributeOptions: options,
      variantCombinations: combinations,
    }

    bulkVariantCache = { at: now, data }
    return data
  } catch (error) {
    console.error('[GoogleSheets] Fetch all variant data error:', error)
    return null
  }
}

function groupVariantData(data: ProductVariantData): Map<string, ProductVariantData> {
  const map = new Map<string, ProductVariantData>()

  const ensure = (productId: string): ProductVariantData => {
    const existing = map.get(productId)
    if (existing) return existing
    const created: ProductVariantData = {
      variantAttributes: [],
      attributeOptions: [],
      variantCombinations: [],
    }
    map.set(productId, created)
    return created
  }

  // Attributes first so options can be attached to their owning product.
  const attributeToProduct = new Map<string, string>()
  for (const attribute of data.variantAttributes) {
    if (!attribute.productId) continue
    ensure(attribute.productId).variantAttributes.push(attribute)
    attributeToProduct.set(attribute.id, attribute.productId)
  }

  for (const option of data.attributeOptions) {
    const productId = attributeToProduct.get(option.attributeId)
    if (productId) ensure(productId).attributeOptions.push(option)
  }

  for (const combination of data.variantCombinations) {
    if (!combination.productId) continue
    ensure(combination.productId).variantCombinations.push(combination)
  }

  for (const value of map.values()) {
    value.variantAttributes = sortByOrder(value.variantAttributes)
    value.attributeOptions = sortByOrder(value.attributeOptions)
    value.variantCombinations = sortByOrder(value.variantCombinations)
  }

  return map
}

async function getVariantDataForProduct(productId: string): Promise<ProductVariantData> {
  const attributes = await getVariantAttributes(productId)
  if (attributes.length === 0) return { ...EMPTY_VARIANT_DATA }

  const optionsByAttribute = await Promise.all(
    attributes.map((attribute) => getAttributeOptions(attribute.id))
  )
  const combinations = await getVariantCombinations(productId)

  return {
    variantAttributes: attributes,
    attributeOptions: optionsByAttribute.flat(),
    variantCombinations: combinations,
  }
}

function filterActive(data: ProductVariantData, includeInactive: boolean): ProductVariantData {
  if (includeInactive) return data

  const activeAttributes = data.variantAttributes.filter((item) => item.status === 'active')
  const activeAttributeIds = new Set(activeAttributes.map((item) => item.id))

  return {
    variantAttributes: sortByOrder(activeAttributes),
    attributeOptions: sortByOrder(
      data.attributeOptions.filter(
        (item) => item.status === 'active' && activeAttributeIds.has(item.attributeId)
      )
    ),
    variantCombinations: sortByOrder(
      data.variantCombinations.filter((item) => item.status === 'active')
    ),
  }
}

export async function getProductsWithVariants(
  options: { includeInactive?: boolean; noCache?: boolean } = {}
): Promise<Product[]> {
  const includeInactive = options.includeInactive === true
  const noCache = options.noCache === true
  const products = await getGoogleSheetsData({ noCache })
  if (products.length === 0) return []

  const bulk = await getAllVariantData(noCache)
  if (bulk) {
    const grouped = groupVariantData(bulk)
    return products.map((product) => ({
      ...product,
      ...filterActive(grouped.get(product.id) || EMPTY_VARIANT_DATA, includeInactive),
    }))
  }

  // Legacy Apps Script fallback (one set of calls per product).
  return Promise.all(
    products.map(async (product) => {
      const data = await getVariantDataForProduct(product.id)
      return { ...product, ...filterActive(data, includeInactive) }
    })
  )
}

export async function getProductWithVariants(
  productId: string,
  options: { includeInactive?: boolean; noCache?: boolean } = {}
): Promise<Product | null> {
  const includeInactive = options.includeInactive === true
  const noCache = options.noCache === true
  const products = await getGoogleSheetsData({ noCache })
  const product = products.find((item) => item.id === productId)
  if (!product) return null

  const bulk = await getAllVariantData(noCache)
  if (bulk) {
    const grouped = groupVariantData(bulk)
    return {
      ...product,
      ...filterActive(grouped.get(product.id) || EMPTY_VARIANT_DATA, includeInactive),
    }
  }

  const data = await getVariantDataForProduct(product.id)
  return { ...product, ...filterActive(data, includeInactive) }
}

// ---------------------------------------------------------------------------
// Product writes
// ---------------------------------------------------------------------------

async function postProductAction(
  payload: Record<string, unknown>,
  fallbackMessage: string
): Promise<void> {
  const result = await appsScriptPost(payload)
  if (!result.success) {
    throw new Error(result.message || fallbackMessage)
  }
  invalidateVariantCache()
}

export async function addProductToGoogleSheets(product: {
  name: string
  price: number
  duration?: string
  stock?: number
  image?: string
  description?: string
  attributes?: unknown[]
  options?: unknown[]
  combinations?: unknown[]
}): Promise<void> {
  await postProductAction(
    {
      action: 'addProduct',
      name: product.name,
      price: product.price,
      duration: product.duration || '',
      stock: product.stock ?? 0,
      image: product.image || '',
      description: product.description || '',
      attributes: product.attributes || [],
      options: product.options || [],
      combinations: product.combinations || [],
    },
    'Gagal menambahkan produk'
  )
}

export async function updateProductInGoogleSheets(product: {
  id: string
  name: string
  price: number
  duration?: string
  stock?: number
  image?: string
  description?: string
}): Promise<void> {
  await postProductAction(
    {
      action: 'updateProduct',
      id: product.id,
      name: product.name,
      price: product.price,
      duration: product.duration || '',
      stock: product.stock ?? 0,
      image: product.image || '',
      description: product.description || '',
    },
    'Gagal memperbarui produk'
  )
}

export async function deleteProductFromGoogleSheets(id: string): Promise<void> {
  await postProductAction({ action: 'deleteProduct', id }, 'Gagal menghapus produk')
}

// ---------------------------------------------------------------------------
// Variant writes
// ---------------------------------------------------------------------------

export async function addVariantAttributeToGoogleSheets(attribute: {
  productId: string
  name: string
  status?: 'active' | 'inactive'
}): Promise<void> {
  await postProductAction(
    { action: 'addVariantAttribute', ...attribute },
    'Gagal menambahkan atribut varian'
  )
}

export async function updateVariantAttributeInGoogleSheets(attribute: {
  id: string
  name?: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}): Promise<void> {
  await postProductAction(
    { action: 'updateVariantAttribute', ...attribute },
    'Gagal memperbarui atribut varian'
  )
}

export async function deleteVariantAttributeFromGoogleSheets(id: string): Promise<void> {
  await postProductAction(
    { action: 'deleteVariantAttribute', id },
    'Gagal menghapus atribut varian'
  )
}

export async function addAttributeOptionToGoogleSheets(option: {
  attributeId: string
  name: string
  status?: 'active' | 'inactive'
}): Promise<void> {
  await postProductAction(
    { action: 'addAttributeOption', ...option },
    'Gagal menambahkan opsi atribut'
  )
}

export async function updateAttributeOptionInGoogleSheets(option: {
  id: string
  name?: string
  sortOrder?: number
  status?: 'active' | 'inactive'
}): Promise<void> {
  await postProductAction(
    { action: 'updateAttributeOption', ...option },
    'Gagal memperbarui opsi atribut'
  )
}

export async function deleteAttributeOptionFromGoogleSheets(id: string): Promise<void> {
  await postProductAction(
    { action: 'deleteAttributeOption', id },
    'Gagal menghapus opsi atribut'
  )
}

export async function addVariantCombinationToGoogleSheets(combination: {
  productId: string
  price: number
  status?: 'active' | 'inactive'
  stock?: number
  options: Record<string, string>
}): Promise<void> {
  await postProductAction(
    { action: 'addVariantCombination', ...combination },
    'Gagal menambahkan kombinasi varian'
  )
}

export async function updateVariantCombinationInGoogleSheets(combination: {
  id: string
  price?: number
  status?: 'active' | 'inactive'
  stock?: number
  sortOrder?: number
  options?: Record<string, string>
}): Promise<void> {
  await postProductAction(
    { action: 'updateVariantCombination', ...combination },
    'Gagal memperbarui kombinasi varian'
  )
}

export async function deleteVariantCombinationFromGoogleSheets(id: string): Promise<void> {
  await postProductAction(
    { action: 'deleteVariantCombination', id },
    'Gagal menghapus kombinasi varian'
  )
}
