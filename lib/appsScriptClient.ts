import 'server-only'

/**
 * Single entry point for every call to the Google Apps Script Web App.
 * Centralises configuration checks, the optional shared secret, timeouts
 * and JSON/HTTP error handling so routes do not duplicate this logic.
 */

const APPS_SCRIPT_URL = (
  process.env.GOOGLE_APPS_SCRIPT_URL ||
  process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL ||
  ''
).trim()

const APPS_SCRIPT_SECRET = (process.env.GOOGLE_APPS_SCRIPT_SECRET || '').trim()

const DEFAULT_TIMEOUT_MS = 30_000

export interface AppsScriptResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  count?: number
  [key: string]: unknown
}

export function isAppsScriptConfigured(): boolean {
  return APPS_SCRIPT_URL.length > 0
}

function requireUrl(): string {
  if (!APPS_SCRIPT_URL) {
    throw new Error('GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi di .env.local')
  }
  return APPS_SCRIPT_URL
}

function buildUrl(action: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(requireUrl())
  url.searchParams.set('action', action)
  if (APPS_SCRIPT_SECRET) url.searchParams.set('secret', APPS_SCRIPT_SECRET)

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(key, String(value))
  }

  return url.toString()
}

async function parseResponse(response: Response, action: string): Promise<AppsScriptResponse> {
  const text = await response.text()

  if (!response.ok) {
    throw new Error(`Google Apps Script HTTP ${response.status} (${action})`)
  }

  try {
    const parsed = JSON.parse(text) as AppsScriptResponse
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('empty body')
    }
    return parsed
  } catch {
    throw new Error(`Respons Google Apps Script tidak valid (${action})`)
  }
}

export async function appsScriptGet<T = unknown>(
  action: string,
  params: Record<string, string | number | undefined> = {},
  options: { revalidate?: number; timeoutMs?: number } = {}
): Promise<AppsScriptResponse<T>> {
  const url = buildUrl(action, params)
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    ...(options.revalidate === undefined
      ? { cache: 'no-store' as const }
      : { next: { revalidate: options.revalidate } }),
  })

  return (await parseResponse(response, action)) as AppsScriptResponse<T>
}

export async function appsScriptPost<T = unknown>(
  payload: Record<string, unknown>,
  options: { timeoutMs?: number } = {}
): Promise<AppsScriptResponse<T>> {
  const action = String(payload.action || '')
  if (!action) throw new Error('Action Google Apps Script wajib diisi')

  const url = buildUrl(action, {})
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ ...payload, action }),
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
  })

  return (await parseResponse(response, action)) as AppsScriptResponse<T>
}

/** Throws a readable error when Apps Script reports a failed operation. */
export async function appsScriptPostOrThrow<T = unknown>(
  payload: Record<string, unknown>,
  fallbackMessage: string
): Promise<AppsScriptResponse<T>> {
  const result = await appsScriptPost<T>(payload)
  if (!result.success) {
    throw new Error(result.message || fallbackMessage)
  }
  return result
}
