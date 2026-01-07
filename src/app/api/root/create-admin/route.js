import { NextResponse } from "next/server"
import { requireRoot } from "@/lib/guards"

export async function POST(req) {
  const guard = requireRoot(req)
  if (guard) return guard

  // 🔥 only root reaches here
  return NextResponse.json({
    message: "Admin created successfully",
  })
}
