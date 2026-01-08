// middleware.js - Enhanced Security (Production Ready)
import { NextResponse } from 'next/server';
import { verifyToken } from './src/lib/auth/jwt';
import { validateOrigin, validateReferer } from './src/lib/security/csrf';

export async function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/verify-email'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isRootPath = pathname === '/';

  // Static files and API health checks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    pathname === '/api/health'
  ) {
    return NextResponse.next();
  }

  // ✅ CSRF PROTECTION for POST/PUT/DELETE API routes
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const referer = request.headers.get('referer');
    
    // Skip CSRF check for auth endpoints
    if (pathname === '/api/auth/csrf' || pathname === '/api/auth/send-otp' || pathname === '/api/auth/verify-otp') {
      return NextResponse.next();
    }
    
    // Validate Origin header
    if (!validateOrigin(origin, host)) {
      return NextResponse.json(
        { success: false, message: 'Invalid origin' },
        { status: 403 }
      );
    }
    
    // Validate Referer header
    if (!validateReferer(referer, host)) {
      return NextResponse.json(
        { success: false, message: 'Invalid referer' },
        { status: 403 }
      );
    }
  }

  // ✅ Root path handling
  if (isRootPath) {
    if (token) {
      const verified = await verifyToken(token);
      if (verified.success) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        response.cookies.delete('csrf_token');
        return response;
      }
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ✅ NO TOKEN + PROTECTED ROUTE → Redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ HAS TOKEN + PUBLIC ROUTE → Verify token first
  if (token && isPublicRoute) {
    const verified = await verifyToken(token);
    if (verified.success) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      const response = NextResponse.next();
      response.cookies.delete('auth_token');
      response.cookies.delete('csrf_token');
      return response;
    }
  }

  // ✅ VERIFY JWT TOKEN for protected routes
  if (token && !isPublicRoute) {
    const verified = await verifyToken(token);
    
    if (!verified.success) {
      const response = NextResponse.redirect(new URL('/login?expired=true', request.url));
      response.cookies.delete('auth_token');
      response.cookies.delete('csrf_token');
      return response;
    }

    // Add user info to request headers
    const response = NextResponse.next();
    response.headers.set('x-user-id', verified.payload.userId?.toString() || '');
    response.headers.set('x-user-email', verified.payload.email || '');
    response.headers.set('x-user-name', verified.payload.name || 'User');
    response.headers.set('x-user-role', verified.payload.role || 'user');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
