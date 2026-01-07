import { NextResponse } from "next/server"

export function middleware(req) {
  const { pathname } = req.nextUrl

  // sirf dashboard protect
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }

  const token = req.cookies.get("hgdhgf76776djhfjdhfjdh87878dfdjhfj")?.value

  // ❌ token nahi → login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // ✅ token hai → allow
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
