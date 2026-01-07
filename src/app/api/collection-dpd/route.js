// app/api/collection-dpd/route.js

import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* =========================
   GET COLLECTION OFFICERS
   Returns users with CO1, CO2, CO3 roles
========================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const company_id = searchParams.get("company_id")

    let companyCondition = ""
    if (company_id) {
      companyCondition = `AND u.company_id = ${company_id}`
    }

    const query = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        u.mobile,
        u.designation,
        u.company_id,
        GROUP_CONCAT(DISTINCT mrt.labels ORDER BY mrt.id) AS roles,
        GROUP_CONCAT(DISTINCT mrt.sub_name ORDER BY mrt.id SEPARATOR ' | ') AS role_names
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN master_role_types mrt ON ur.type_id = mrt.id
      WHERE ur.active = 1
        AND ur.deleted = 0
        AND u.user_active = 1
        AND u.user_deleted = 0
        AND u.user_status_id = 1
        AND ur.type_id = 15
        AND NOT EXISTS (
          SELECT 1 
          FROM user_roles ur_admin 
          WHERE ur_admin.user_id = u.id 
            AND ur_admin.type_id IN (1, 2)
            AND ur_admin.active = 1 
            AND ur_admin.deleted = 0
        )
        ${companyCondition}
      GROUP BY 
        u.id,
        u.name,
        u.email,
        u.mobile,
        u.designation,
        u.company_id
      ORDER BY u.id DESC
    `

    const [rows] = await db.query(query)

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (err) {
    console.error("COLLECTION DPD GET USERS ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
