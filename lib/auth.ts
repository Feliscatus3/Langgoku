const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'adminku'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Langgoku7894$'

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function setAdminCookie(response: any) {
  response.cookies.set('admin_token', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export function getAdminCookie(request: any): string | null {
  return request.cookies.get('admin_token')?.value || null
}
