import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('session')
  const { pathname } = request.nextUrl

  // Öffentliche Routen
  if (['/login', '/register', '/verify-email'].includes(pathname)) {
    if (authCookie) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // API-Routen überspringen
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Geschützte Routen
  if (!authCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verifiziere den Token über die API-Route
    const response = await fetch(new URL('/api/verify-token', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: authCookie.value }),
    });

    const { valid, email_verified } = await response.json();

    if (!valid) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!email_verified && pathname !== '/verify-email') {
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 