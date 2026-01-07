// app/api/dpd/route.js

import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* =========================
   GET DPD RULES (WITH COMPANY FILTER)
========================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const company_id = searchParams.get("company_id")  // ✅ NEW
    
    if (id) {
      // Get single DPD rule
      const [rows] = await db.query(
        "SELECT * FROM auto_approved_dpd_percentage WHERE id = ?",
        [id]
      )
      
      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "DPD rule not found" },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ success: true, data: rows[0] })
    }
    
    // ✅ Get DPD rules filtered by company_id
    let query = "SELECT * FROM auto_approved_dpd_percentage"
    let params = []
    
    if (company_id) {
      query += " WHERE company_id = ?"
      params.push(company_id)
    }
    
    query += " ORDER BY start_dpd ASC"
    
    const [rows] = await db.query(query, params)
    
    return NextResponse.json({ success: true, data: rows })
  } catch (err) {
    console.error("DPD GET Error:", err)
    return NextResponse.json(
      { success: false, message: "Failed to fetch DPD rules" },
      { status: 500 }
    )
  }
}

/* =========================
   ADD DPD RULE WITH COMPANY_ID
========================= */
export async function POST(req) {
  try {
    const body = await req.json()
    const { company_id, name, start_dpd, end_dpd, percentage } = body  // ✅ Added company_id

    // ✅ Validate company_id
    if (!company_id) {
      return NextResponse.json(
        { success: false, message: "Brand is required" },
        { status: 400 }
      )
    }

    // ✅ Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      )
    }

    if (start_dpd === null || start_dpd === undefined || start_dpd === "") {
      return NextResponse.json(
        { success: false, message: "Start DPD is required" },
        { status: 400 }
      )
    }

    if (end_dpd === null || end_dpd === undefined || end_dpd === "") {
      return NextResponse.json(
        { success: false, message: "End DPD is required" },
        { status: 400 }
      )
    }

    if (percentage === null || percentage === undefined || percentage === "") {
      return NextResponse.json(
        { success: false, message: "Percentage is required" },
        { status: 400 }
      )
    }

    // ✅ Validate data types
    const startDPD = parseInt(start_dpd)
    const endDPD = parseInt(end_dpd)
    const pct = parseFloat(percentage)

    if (isNaN(startDPD)) {
      return NextResponse.json(
        { success: false, message: "Start DPD must be a number" },
        { status: 400 }
      )
    }

    if (isNaN(endDPD)) {
      return NextResponse.json(
        { success: false, message: "End DPD must be a number" },
        { status: 400 }
      )
    }

    if (isNaN(pct)) {
      return NextResponse.json(
        { success: false, message: "Percentage must be a number" },
        { status: 400 }
      )
    }

    // ✅ Business logic validation
    if (startDPD > endDPD) {
      return NextResponse.json(
        { success: false, message: "Start DPD must be less than or equal to End DPD" },
        { status: 400 }
      )
    }

    if (pct < 0 || pct > 500) {
      return NextResponse.json(
        { success: false, message: "Percentage must be between 0 and 500" },
        { status: 400 }
      )
    }

    // ✅ Check for overlapping ranges within same company
    // const [overlap] = await db.query(
    //   `SELECT id FROM auto_approved_dpd_percentage 
    //    WHERE company_id = ?
    //      AND ((? BETWEEN start_dpd AND end_dpd) 
    //       OR (? BETWEEN start_dpd AND end_dpd)
    //       OR (start_dpd BETWEEN ? AND ?)
    //       OR (end_dpd BETWEEN ? AND ?))`,
    //   [company_id, startDPD, endDPD, startDPD, endDPD, startDPD, endDPD]
    // )

    // if (overlap.length > 0) {
    //   return NextResponse.json(
    //     { success: false, message: "DPD range overlaps with existing rule for this brand" },
    //     { status: 400 }
    //   )
    // }

    // ✅ Insert with company_id
    await db.query(
      `INSERT INTO auto_approved_dpd_percentage 
       (company_id, name, start_dpd, end_dpd, percentage) 
       VALUES (?, ?, ?, ?, ?)`,
      [parseInt(company_id), name.trim(), startDPD, endDPD, pct]
    )

    return NextResponse.json({ 
      success: true, 
      message: "DPD rule added successfully" 
    })
  } catch (err) {
    console.error("DPD POST Error:", err)
    return NextResponse.json(
      { success: false, message: "Failed to add DPD rule" },
      { status: 500 }
    )
  }
}

/* =========================
   UPDATE DPD RULE
========================= */
export async function PUT(req) {
  try {
    const body = await req.json()
    const { id, company_id, name, start_dpd, end_dpd, percentage } = body  // ✅ Added company_id

    // ✅ Validate ID
    if (!id) {
      return NextResponse.json(
        { success: false, message: "DPD rule ID is required" },
        { status: 400 }
      )
    }

    // ✅ Validate company_id
    if (!company_id) {
      return NextResponse.json(
        { success: false, message: "Brand is required" },
        { status: 400 }
      )
    }

    // ✅ Check if exists
    const [existingRule] = await db.query(
      "SELECT id FROM auto_approved_dpd_percentage WHERE id = ?",
      [id]
    )

    if (existingRule.length === 0) {
      return NextResponse.json(
        { success: false, message: "DPD rule not found" },
        { status: 404 }
      )
    }

    // ✅ Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      )
    }

    if (start_dpd === null || start_dpd === undefined || start_dpd === "") {
      return NextResponse.json(
        { success: false, message: "Start DPD is required" },
        { status: 400 }
      )
    }

    if (end_dpd === null || end_dpd === undefined || end_dpd === "") {
      return NextResponse.json(
        { success: false, message: "End DPD is required" },
        { status: 400 }
      )
    }

    if (percentage === null || percentage === undefined || percentage === "") {
      return NextResponse.json(
        { success: false, message: "Percentage is required" },
        { status: 400 }
      )
    }

    // ✅ Validate data types
    const startDPD = parseInt(start_dpd)
    const endDPD = parseInt(end_dpd)
    const pct = parseFloat(percentage)

    if (isNaN(startDPD)) {
      return NextResponse.json(
        { success: false, message: "Start DPD must be a number" },
        { status: 400 }
      )
    }

    if (isNaN(endDPD)) {
      return NextResponse.json(
        { success: false, message: "End DPD must be a number" },
        { status: 400 }
      )
    }

    if (isNaN(pct)) {
      return NextResponse.json(
        { success: false, message: "Percentage must be a number" },
        { status: 400 }
      )
    }

    // ✅ Business logic validation
    if (startDPD > endDPD) {
      return NextResponse.json(
        { success: false, message: "Start DPD must be less than or equal to End DPD" },
        { status: 400 }
      )
    }

    if (pct < 0 || pct > 500) {
      return NextResponse.json(
        { success: false, message: "Percentage must be between 0 and 500" },
        { status: 400 }
      )
    }

    // ✅ Check for overlapping ranges (excluding current rule, within same company)
    // const [overlap] = await db.query(
    //   `SELECT id FROM auto_approved_dpd_percentage 
    //    WHERE id != ?
    //      AND company_id = ?
    //      AND ((? BETWEEN start_dpd AND end_dpd) 
    //       OR (? BETWEEN start_dpd AND end_dpd)
    //       OR (start_dpd BETWEEN ? AND ?)
    //       OR (end_dpd BETWEEN ? AND ?))`,
    //   [id, company_id, startDPD, endDPD, startDPD, endDPD, startDPD, endDPD]
    // )

    // if (overlap.length > 0) {
    //   return NextResponse.json(
    //     { success: false, message: "DPD range overlaps with existing rule for this brand" },
    //     { status: 400 }
    //   )
    // }

    // ✅ Update with company_id
    await db.query(
      `UPDATE auto_approved_dpd_percentage 
       SET company_id = ?, name = ?, start_dpd = ?, end_dpd = ?, percentage = ?
       WHERE id = ?`,
      [parseInt(company_id), name.trim(), startDPD, endDPD, pct, id]
    )

    return NextResponse.json({ 
      success: true, 
      message: "DPD rule updated successfully" 
    })
  } catch (err) {
    console.error("DPD PUT Error:", err)
    return NextResponse.json(
      { success: false, message: "Failed to update DPD rule" },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE DPD RULE
========================= */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, message: "DPD rule ID is required" },
        { status: 400 }
      )
    }

    // ✅ Check if exists
    const [existingRule] = await db.query(
      "SELECT id FROM auto_approved_dpd_percentage WHERE id = ?",
      [id]
    )

    if (existingRule.length === 0) {
      return NextResponse.json(
        { success: false, message: "DPD rule not found" },
        { status: 404 }
      )
    }

    // ✅ Delete (hard delete)
    await db.query(
      "DELETE FROM auto_approved_dpd_percentage WHERE id = ?",
      [id]
    )

    return NextResponse.json({ 
      success: true, 
      message: "DPD rule deleted successfully" 
    })
  } catch (err) {
    console.error("DPD DELETE Error:", err)
    return NextResponse.json(
      { success: false, message: "Failed to delete DPD rule" },
      { status: 500 }
    )
  }
}
