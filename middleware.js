// middleware.js - Enhanced Security with CSRF Protection
import { NextResponse } from 'next/server';
import { verifyToken } from './src/lib/auth/jwt';
import { validateOrigin, validateReferer, verifyCSRFToken } from './src/lib/security/csrf';

export async function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/verify-email'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

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
    
    // Skip CSRF check for token generation endpoint
    if (pathname === '/api/auth/csrf') {
      return NextResponse.next();
    }
    
    // Validate Origin header
    if (!validateOrigin(origin, host)) {
      console.warn('🚨 CSRF attempt detected - Invalid origin:', origin);
      return NextResponse.json(
        { success: false, message: 'Invalid origin' },
        { status: 403 }
      );
    }
    
    // Validate Referer header
    if (!validateReferer(referer, host)) {
      console.warn('🚨 CSRF attempt detected - Invalid referer:', referer);
      return NextResponse.json(
        { success: false, message: 'Invalid referer' },
        { status: 403 }
      );
    }
    
    // Verify CSRF token for authenticated requests
    if (token && !pathname.includes('/send-otp')) {
      const csrfToken = request.headers.get('x-csrf-token');
      const csrfCookie = request.cookies.get('csrf_token')?.value;
      
      if (!verifyCSRFToken(csrfToken, csrfCookie)) {
        console.warn('🚨 CSRF token validation failed');
        return NextResponse.json(
          { success: false, message: 'Invalid CSRF token' },
          { status: 403 }
        );
      }
    }
  }

  // ✅ Authentication check - No token + protected route → redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Logged in + public route → redirect to dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ✅ Verify JWT token for protected routes
  if (token && !isPublicRoute) {
    const verified = await verifyToken(token);
    
    if (!verified.success) {
      console.warn('⚠️ Invalid/expired token, logging out user');
      const response = NextResponse.redirect(new URL('/login?expired=true', request.url));
      response.cookies.delete('auth_token');
      response.cookies.delete('csrf_token');
      return response;
    }

    // Add user info to request headers for downstream use
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
