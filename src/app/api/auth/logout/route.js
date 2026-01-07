// app/api/auth/logout/route.js

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Clear the auth token cookie
    cookieStore.delete("auth_token")

    return NextResponse.json(
      { 
        message: "Logged out successfully",
        success: true 
      },
      { status: 200 }
    )
  } catch (err) {
    console.error("LOGOUT ERROR:", err)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST()
}
