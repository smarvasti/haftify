import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('session')
  const { pathname, searchParams } = request.nextUrl

  // Statische Ressourcen und API-Routen überspringen
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.svg')
  ) {
    return NextResponse.next()
  }

  // Öffentliche Routen
  if (['/login', '/register'].includes(pathname)) {
    return NextResponse.next()
  }

  // Spezielle Behandlung für verify-email
  if (pathname === '/verify-email') {
    // Wenn es ein Verifizierungslink ist (mit oobCode), erlaube den Zugriff
    if (searchParams.get('mode') === 'verifyEmail' && searchParams.get('oobCode')) {
      return NextResponse.next()
    }
    // Wenn kein Auth-Cookie vorhanden ist, zum Login umleiten
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Geschützte Routen
  if (!authCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 