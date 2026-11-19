/** Shared, framework-agnostic input validators. */

export function isValidImageSource(value: string): boolean {
  const text = String(value || '').trim()
  if (!text) return true
  if (text.startsWith('/')) return true
  return /^https?:\/\//i.test(text)
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(String(value || ''))
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value
}
