import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Rate limiting using Map (DSA: Hash Map - O(1) lookup)
const rateLimitMap = new Map()
const MAX_REQUESTS = 100 // per IP per 15 min
const WINDOW_MS = 15 * 60 * 1000

// IP-based rate limiter
function checkRateLimit(ip) {
  const now = Date.now()
  const userRequests = rateLimitMap.get(ip) || []
  
  // Remove old requests (sliding window)
  const validRequests = userRequests.filter(time => now - time < WINDOW_MS)
  
  if (validRequests.length >= MAX_REQUESTS) {
    return false // Rate limit exceeded
  }
  
  validRequests.push(now)
  rateLimitMap.set(ip, validRequests)
  
  // Cleanup old entries (memory optimization)
  if (rateLimitMap.size > 10000) {
    const oldestTime = now - WINDOW_MS
    for (const [key, times] of rateLimitMap.entries()) {
      if (times.every(t => t < oldestTime)) {
        rateLimitMap.delete(key)
      }
    }
  }
  
  return true
}

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
  
  // Rate limiting check
  if (!checkRateLimit(ip)) {
    return new NextResponse("Too Many Requests", { 
      status: 429,
      headers: {
        'Retry-After': '900' // 15 minutes
      }
    })
  }

  // Public routes - no auth needed
  const publicRoutes = ["/", "/login", "/register", "/forgot-password"]
  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/auth/login")) {
    return NextResponse.next()
  }

  // Protected routes check
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/")) {
    const token = req.cookies.get("auth_token")?.value

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      }
      return NextResponse.redirect(new URL("/login", req.url))
    }

    try {
      // JWT verification with secret
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "your_fallback_secret_change_in_production_min_32_chars"
      )
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
      })

      // Check token expiry
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error("Token expired")
      }

      // Add user info to headers for API routes
      const response = NextResponse.next()
      response.headers.set("x-user-id", payload.userId || "")
      response.headers.set("x-user-email", payload.email || "")
      
      // Security headers
      response.headers.set("X-Content-Type-Options", "nosniff")
      response.headers.set("X-Frame-Options", "DENY")
      response.headers.set("X-XSS-Protection", "1; mode=block")
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
      response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
      )
      
      return response
    } catch (error) {
      console.error("JWT verification failed:", error.message)
      
      if (pathname.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Invalid or expired token" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      }
      
      const response = NextResponse.redirect(new URL("/login", req.url))
      response.cookies.delete("auth_token")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
