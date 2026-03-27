import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to admin pages
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Allow access to API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Allow access to static files
  if (
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Check for maintenance mode by calling settings API
  // This is a simple approach - in production you might want to cache this
  return NextResponse.next()
}

// Only run on page routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}