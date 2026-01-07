import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateOTP, otpExpiry } from "@/lib/otp"
import { sendOTPEmail } from "@/lib/mail"

export async function POST(req) {
  try {
    const { email } = await req.json()

    /* =========================
       BASIC VALIDATION
    ========================= */
    if (!email) {
      return NextResponse.json(
        { message: "Email required" },
        { status: 400 }
      )
    }

    /* =========================
       CHECK ROOT ADMIN
    ========================= */
    const [root] = await db.query(
      `SELECT id FROM sup_root_admin 
       WHERE email = ? AND is_active = 1 
       LIMIT 1`,
      [email]
    )

    /* =========================
       CHECK SUPER ADMIN
    ========================= */
    const [admin] = await db.query(
      `SELECT id FROM sup_admin_users 
       WHERE email = ? AND is_active = 1 
       LIMIT 1`,
      [email]
    )

    if (root.length === 0 && admin.length === 0) {
      return NextResponse.json(
        { message: "Unauthorized email" },
        { status: 401 }
      )
    }

    const role = root.length ? "root" : "superadmin"

    /* =========================
       CLEANUP OLD OTPs (IMPORTANT)
    ========================= */
    await db.query(
      `
      DELETE FROM sup_login_otp
      WHERE email = ?
         OR expires_at < NOW()
         OR is_used = 1
      `,
      [email]
    )

    /* =========================
       RATE LIMIT (60 SEC)
    ========================= */
    const [lastOtp] = await db.query(
      `
      SELECT created_at 
      FROM sup_login_otp
      WHERE email = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [email]
    )

    if (lastOtp.length) {
      const diffSeconds =
        (Date.now() - new Date(lastOtp[0].created_at).getTime()) / 1000

      if (diffSeconds < 60) {
        return NextResponse.json(
          { message: "Please wait before requesting OTP again" },
          { status: 429 }
        )
      }
    }

    /* =========================
       GENERATE & SAVE OTP
    ========================= */
    const otp = generateOTP()

    await db.query(
      `
      INSERT INTO sup_login_otp (email, otp, role, expires_at)
      VALUES (?, ?, ?, ?)
      `,
      [email, otp, role, otpExpiry()]
    )

    /* =========================
       SEND EMAIL
    ========================= */
    await sendOTPEmail({
      to: email,
      otp,
      role,
    })

    return NextResponse.json({
      message: "OTP sent successfully",
    })

  } catch (err) {
    console.error("SEND OTP ERROR:", err)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
