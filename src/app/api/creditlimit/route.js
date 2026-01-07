import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* =========================
   GET CREDIT LIMIT USERS
========================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    // optional filters (future use)
    const roleIds = searchParams.get("role_ids") // e.g. 1,2,4,5

    let roleCondition = "AND ur.type_id IN (1,2,4,5)"

    if (roleIds) {
      roleCondition = `AND ur.type_id IN (${roleIds})`
    }

    const query = `
      SELECT DISTINCT
          u.id,
          u.name,
          u.email,
          u.mobile,
          u.designation,
          u.user_status_id,
          GROUP_CONCAT(DISTINCT ur.type_id ORDER BY ur.type_id) AS role_ids
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.active = 1
          AND ur.deleted = 0
          AND u.user_active = 1
          AND u.user_deleted = 0
          AND u.user_status_id = 1
          ${roleCondition}
      GROUP BY 
          u.id,
          u.name,
          u.email,
          u.mobile,
          u.designation,
          u.user_status_id
      ORDER BY u.id DESC
    `

    const [rows] = await db.query(query)

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (err) {
    console.error("CREDIT LIMIT GET ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
