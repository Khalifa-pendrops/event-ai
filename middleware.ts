import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Set a persistent visitor cookie for view deduping if it doesn't exist.
  // This runs before the page, so the cookie is available in responses.
  if (!request.cookies.has('evly_visitor')) {
    const visitorId = crypto.randomUUID()
    response.cookies.set('evly_visitor', visitorId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 2, // ~2 years
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: '/e/:path*',
}