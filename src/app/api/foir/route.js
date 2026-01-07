import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* =========================
   GET FOIR RULES (WITH COMPANY FILTER)
========================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const company_id = searchParams.get("company_id")
    
    let query = "SELECT * FROM auto_foir_percentage"
    let params = []
    
    if (company_id) {
      query += " WHERE company_id = ?"
      params.push(company_id)
    }
    
    query += " ORDER BY id ASC"
    
    const [rows] = await db.query(query, params)
    
    return NextResponse.json({ success: true, data: rows })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   ADD FOIR WITH COMPANY_ID
========================= */
export async function POST(req) {
  try {
    const body = await req.json()

    // ✅ Validate company_id
    if (!body.company_id) {
      return NextResponse.json(
        { success: false, message: "Brand is required" },
        { status: 400 }
      )
    }

    // ✅ Validate required fields
    if (!body.category?.trim()) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 }
      )
    }

    if (!body.parameter?.trim()) {
      return NextResponse.json(
        { success: false, message: "Parameter is required" },
        { status: 400 }
      )
    }

    await db.query(
      `INSERT INTO auto_foir_percentage
      (company_id, category, parameter,
       moreThanEqualsto_25k_and_lessThan35k,
       moreThanEqualsto_35k_and_lessThan50k,
       moreThanEqualsto_50k)
       VALUES (?,?,?,?,?,?)`,
      [
        parseInt(body.company_id),
        body.category.trim(),
        body.parameter.trim(),
        body.moreThanEqualsto_25k_and_lessThan35k,
        body.moreThanEqualsto_35k_and_lessThan50k,
        body.moreThanEqualsto_50k,
      ]
    )

    return NextResponse.json({ 
      success: true, 
      message: "FOIR rule added successfully" 
    })
  } catch (err) {
    console.error("FOIR POST Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   UPDATE FOIR WITH COMPANY_ID
========================= */
export async function PUT(req) {
  try {
    const body = await req.json()

    // ✅ Validate ID
    if (!body.id) {
      return NextResponse.json(
        { success: false, message: "FOIR rule ID is required" },
        { status: 400 }
      )
    }

    // ✅ Validate company_id
    if (!body.company_id) {
      return NextResponse.json(
        { success: false, message: "Brand is required" },
        { status: 400 }
      )
    }

    // ✅ Validate required fields
    if (!body.category?.trim()) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 }
      )
    }

    if (!body.parameter?.trim()) {
      return NextResponse.json(
        { success: false, message: "Parameter is required" },
        { status: 400 }
      )
    }

    // ✅ Check if exists
    const [existingRule] = await db.query(
      "SELECT id FROM auto_foir_percentage WHERE id = ?",
      [body.id]
    )

    if (existingRule.length === 0) {
      return NextResponse.json(
        { success: false, message: "FOIR rule not found" },
        { status: 404 }
      )
    }

    await db.query(
      `UPDATE auto_foir_percentage SET
        company_id=?,
        category=?,
        parameter=?,
        moreThanEqualsto_25k_and_lessThan35k=?,
        moreThanEqualsto_35k_and_lessThan50k=?,
        moreThanEqualsto_50k=?
       WHERE id=?`,
      [
        parseInt(body.company_id),
        body.category.trim(),
        body.parameter.trim(),
        body.moreThanEqualsto_25k_and_lessThan35k,
        body.moreThanEqualsto_35k_and_lessThan50k,
        body.moreThanEqualsto_50k,
        body.id,
      ]
    )

    return NextResponse.json({ 
      success: true, 
      message: "FOIR rule updated successfully" 
    })
  } catch (err) {
    console.error("FOIR PUT Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE FOIR
========================= */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, message: "FOIR rule ID is required" },
        { status: 400 }
      )
    }

    // ✅ Check if exists
    const [existingRule] = await db.query(
      "SELECT id FROM auto_foir_percentage WHERE id = ?",
      [id]
    )

    if (existingRule.length === 0) {
      return NextResponse.json(
        { success: false, message: "FOIR rule not found" },
        { status: 404 }
      )
    }

    await db.query("DELETE FROM auto_foir_percentage WHERE id=?", [id])

    return NextResponse.json({ 
      success: true, 
      message: "FOIR rule deleted successfully" 
    })
  } catch (err) {
    console.error("FOIR DELETE Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
