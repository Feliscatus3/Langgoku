import 'server-only'

import { appsScriptGet, isAppsScriptConfigured } from './appsScriptClient'

export type StoreSettingsRecord = Record<string, unknown>

const CACHE_TTL_MS = 10_000
let cache: { at: number; data: StoreSettingsRecord | null } | null = null
let inFlight: Promise<StoreSettingsRecord | null> | null = null

/**
 * Deduplicates the several settings reads performed while rendering a page
 * (maintenance check, announcement bar, popup, checkout).
 */
export async function getStoreSettings(): Promise<StoreSettingsRecord | null> {
  if (!isAppsScriptConfigured()) return null

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.data
  }

  if (inFlight) return inFlight

  inFlight = (async () => {
    const response = await appsScriptGet<StoreSettingsRecord>('getSettings', {}, { revalidate: 10 })
    if (!response.success || !response.data || typeof response.data !== 'object') return null
    return response.data
  })()

  try {
    const data = await inFlight
    cache = { at: Date.now(), data }
    return data
  } finally {
    inFlight = null
  }
}

export function invalidateStoreSettings(): void {
  cache = null
}
