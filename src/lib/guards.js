import { NextResponse } from "next/server"
/* =========================
   ROOT ONLY
========================= */
export function requireRoot(req) {
  const role = req.headers.get("x-user-role")

  if (role !== "root") {
    return NextResponse.json(
      { message: "Root access only" },
      { status: 403 }
    )
  }

  return null
}
/* =========================
   ADMIN OR ROOT
========================= */
export function requireAdmin(req) {
  const role = req.headers.get("x-user-role")

  if (!["root", "superadmin"].includes(role)) {
    return NextResponse.json(
      { message: "Admin access only" },
      { status: 403 }
    )
  }

  return null
}