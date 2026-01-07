// app/api/collection-dpd/categories/route.js

import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* =========================
   GET DPD CATEGORIES (Master Table)
========================= */
export async function GET(req) {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        dpd_category,
        dpd_range,
        start_dpd,
        end_dpd,
        active
      FROM master_collection_dpd_category
      WHERE deleted = 0 AND active = 1
      ORDER BY 
        CASE dpd_category
          WHEN 'CS1' THEN 1
          WHEN 'CS2' THEN 2
          WHEN 'CS3' THEN 3
          WHEN 'CS4' THEN 4
          WHEN 'CS5' THEN 5
          WHEN '90+' THEN 6
          ELSE 100
        END,
        start_dpd ASC
    `)

    return NextResponse.json({ success: true, data: rows })
  } catch (err) {
    console.error("DPD CATEGORIES GET ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   ADD CUSTOM DPD CATEGORY
   Auto-generates CS code (CS5, CS6, etc.)
========================= */
export async function POST(req) {
  try {
    const { start_dpd, end_dpd } = await req.json()

    if (start_dpd === undefined || end_dpd === undefined) {
      return NextResponse.json(
        { success: false, message: "Start and End DPD are required" },
        { status: 400 }
      )
    }

    if (start_dpd > end_dpd) {
      return NextResponse.json(
        { success: false, message: "Start DPD must be less than or equal to End DPD" },
        { status: 400 }
      )
    }

    // ✅ Check if same range already exists (active records only)
    const [existing] = await db.query(
      `SELECT id, dpd_category FROM master_collection_dpd_category 
       WHERE start_dpd = ? AND end_dpd = ? AND deleted = 0 AND active = 1`,
      [start_dpd, end_dpd]
    )

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `This range already exists as ${existing[0].dpd_category}` },
        { status: 409 }
      )
    }

    // ✅ Generate next CS code automatically
    const [lastCategory] = await db.query(`
      SELECT dpd_category 
      FROM master_collection_dpd_category 
      WHERE dpd_category LIKE 'CS%'
        AND deleted = 0
      ORDER BY 
        CAST(SUBSTRING(dpd_category, 3) AS UNSIGNED) DESC
      LIMIT 1
    `)

    let nextCategory = 'CS5' // Default start

    if (lastCategory.length > 0) {
      const lastCode = lastCategory[0].dpd_category
      const lastNumber = parseInt(lastCode.replace('CS', ''))
      nextCategory = `CS${lastNumber + 1}`
    }

    const dpd_range = `${start_dpd} to ${end_dpd}`

    // ✅ Insert with auto-generated CS code
    await db.query(
      `INSERT INTO master_collection_dpd_category 
       (dpd_category, dpd_range, start_dpd, end_dpd) 
       VALUES (?, ?, ?, ?)`,
      [nextCategory, dpd_range, start_dpd, end_dpd]
    )

    return NextResponse.json({
      success: true,
      message: `Custom category ${nextCategory} added successfully`,
      data: { dpd_category: nextCategory, dpd_range, start_dpd, end_dpd }
    })
  } catch (err) {
    console.error("DPD CATEGORY POST ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   TOGGLE CATEGORY ACTIVE/INACTIVE
========================= */
export async function PUT(req) {
  try {
    const { id, active } = await req.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      )
    }

    if (active === undefined) {
      return NextResponse.json(
        { success: false, message: "Active status is required" },
        { status: 400 }
      )
    }

    // Check if category exists
    const [exists] = await db.query(
      "SELECT dpd_category FROM master_collection_dpd_category WHERE id = ? AND deleted = 0",
      [id]
    )

    if (exists.length === 0) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      )
    }

    // Update active status
    await db.query(
      "UPDATE master_collection_dpd_category SET active = ? WHERE id = ?",
      [active ? 1 : 0, id]
    )

    return NextResponse.json({
      success: true,
      message: `Category ${exists[0].dpd_category} ${active ? 'activated' : 'deactivated'} successfully`,
    })
  } catch (err) {
    console.error("DPD CATEGORY PUT ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
