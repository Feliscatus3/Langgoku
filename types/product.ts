export type VariantStatus = 'active' | 'inactive'

export interface VariantAttribute {
  id: string
  productId: string
  name: string
  sortOrder: number
  status: VariantStatus
}

export interface AttributeOption {
  id: string
  attributeId: string
  name: string
  sortOrder: number
  status: VariantStatus
}

export interface VariantCombination {
  id: string
  productId: string
  price: number
  status: VariantStatus
  stock: number
  sortOrder: number
  /** attributeId -> optionId */
  options: Record<string, string>
}

export interface Product {
  id: string
  name: string
  price: number
  duration?: string
  stock?: number
  image?: string
  description?: string
  category?: string
  createdAt?: string
  variantAttributes?: VariantAttribute[]
  attributeOptions?: AttributeOption[]
  variantCombinations?: VariantCombination[]
}

export interface CheckoutData {
  productId: string
  productName: string
  productDuration?: string
  originalPrice: number
  uniqueCode: string
  uniqueCodeAmount: number
  finalPrice: number
  buyerName: string
  buyerPhone: string
  combinationId?: string
  variantName?: string
}

export interface StoreSettings {
  googleSheetId?: string
  adminPhone: string
  storeEmail: string
  storeName: string
  storeDescription: string
  defaultPaymentMethod?: string
  notificationEnabled?: boolean
  maintenanceMode?: boolean
  announcementText?: string
  announcementEnabled?: boolean
}

export interface PromoCode {
  ID: string
  'Kode Promo': string
  Diskon: number
  'Tipe Diskon': 'percentage' | 'fixed' | string
  Deskripsi: string
  'Batas Penggunaan': number
  'Penggunaan Saat Ini': number
  'Minimal Pembelian': number
  'Maksimal Diskon': number
  'Tanggal Kadaluarsa': string
  Status: string
  'Tanggal Dibuat': string
}

export interface PromoAd {
  ID: string
  'URL Gambar': string
  Judul: string
  Deskripsi: string
  'URL Link': string
  Aktif: boolean
  'Tanggal Dibuat': string
}

export interface BuyerRecord {
  ID: string
  Nama: string
  'No WhatsApp': string
  Produk: string
  Durasi: string
  'Tanggal Mulai': string
  'Tanggal Selesai': string
  Status: string
  'Sisa Hari': number
  [key: string]: unknown
}
