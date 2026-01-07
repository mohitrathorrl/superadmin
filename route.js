import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/guards"

export async function GET(req) {
  const guard = requireAdmin(req)
  if (guard) return guard

  return NextResponse.json({
    message: "Admin dashboard data",
  })
}
