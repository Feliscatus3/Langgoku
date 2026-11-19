/**
 * Tiny in-memory rate limiter for the admin login endpoint.
 * Serverless instances each keep their own counter, which still raises the
 * cost of brute-force attempts substantially.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 10

export function getClientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for') || ''
  return forwarded.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown'
}

export function isLoginRateLimited(key: string): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 0, resetAt: now + WINDOW_MS })
    return false
  }

  return bucket.count >= MAX_ATTEMPTS
}

export function recordLoginFailure(key: string): void {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  bucket.count += 1
}

export function clearLoginFailures(key: string): void {
  buckets.delete(key)
}

// Prevent unbounded growth in long-running processes.
export function pruneLoginBuckets(): void {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key)
  }
}
