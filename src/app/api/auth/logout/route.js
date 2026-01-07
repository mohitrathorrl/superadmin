import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" })

  // 🔥 EXACT same options as login cookie
  res.cookies.set("hgdhgf76776djhfjdhfjdh87878dfdjhfj", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0, // 👈 THIS DELETES COOKIE
  })

  return res
}
