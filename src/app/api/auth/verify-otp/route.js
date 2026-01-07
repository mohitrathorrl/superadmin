// app/api/auth/verify-otp/route.js

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SignJWT } from "jose"
import { cookies } from "next/headers"

export async function POST(req) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP required" },
        { status: 400 }
      )
    }

    // ✅ OTP CHECK
    const [rows] = await db.query(
      `
      SELECT id, role
      FROM sup_login_otp
      WHERE email = ?
        AND otp = ?
        AND is_used = 0
        AND expires_at > NOW()
      ORDER BY id DESC
      LIMIT 1
      `,
      [email, otp]
    )

    if (!rows.length) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 401 }
      )
    }

    // ✅ MARK OTP USED
    await db.query(
      "UPDATE sup_login_otp SET is_used = 1 WHERE id = ?",
      [rows[0].id]
    )

    const role = rows[0].role
    let user

    if (role === "root") {
      const [r] = await db.query(
        "SELECT id, name, email FROM sup_root_admin WHERE email=? AND is_active=1",
        [email]
      )
      user = r[0]
    } else {
      const [a] = await db.query(
        "SELECT id, name, email FROM sup_admin_users WHERE email=? AND is_active=1",
        [email]
      )
      user = a[0]
    }

    if (!user) {
      return NextResponse.json(
        { message: "User not found or inactive" },
        { status: 404 }
      )
    }

    // ✅ JWT Generation using jose (24 hours expiry)
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your_fallback_secret_change_in_production_min_32_chars"
    )
    
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: role,
      type: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // 24 hours
      .sign(secret)

    // ✅ SET SECURE COOKIE (24 hours = 86400 seconds)
    const cookieStore = await cookies()
    cookieStore.set(
      "auth_token", // Changed from random string to standard name
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // Changed from 'lax' to 'strict' for better security
        path: "/",
        maxAge: 86400, // 24 hours = 86400 seconds
      }
    )

    return NextResponse.json({
      message: "Login successful",
      token,
      expiresIn: 86400, // 24 hours in seconds
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
      },
    })

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err)
    return NextResponse.json(
      { message: "Server error", error: process.env.NODE_ENV === "development" ? err.message : undefined },
      { status: 500 }
    )
  }
}
