import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// GET - Fetch setting by company_id
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const company_id = searchParams.get("company_id")
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, message: "Company ID required" },
        { status: 400 }
      )
    }

    const [rows] = await db.query(`
      SELECT 
        ls.id,
        ls.companyid,
        ls.maxamount,
        mb.id as brand_id,
        mb.name,
        mb.code
      FROM lms_setting ls 
      LEFT JOIN master_brands mb ON ls.companyid = mb.id AND mb.deleted = 0
      WHERE ls.companyid = ?
    `, [company_id])

    return NextResponse.json({ 
      success: true, 
      data: rows.length > 0 ? rows[0] : null 
    })
  } catch (err) {
    console.error('LMS GET Error:', err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

// POST - Create or Update (UPSERT)
export async function POST(req) {
  try {
    const body = await req.json()

    if (!body.company_id || !body.max_amount) {
      return NextResponse.json(
        { success: false, message: "Company ID & Max Amount required" },
        { status: 400 }
      )
    }

    await db.query(`
      INSERT INTO lms_setting (companyid, maxamount) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE maxamount = ?
    `, [body.company_id, body.max_amount, body.max_amount])

    return NextResponse.json({ 
      success: true, 
      message: "LMS setting saved" 
    })
  } catch (err) {
    console.error("LMS POST Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove setting
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const company_id = searchParams.get("company_id")

    if (!company_id) {
      return NextResponse.json(
        { success: false, message: "Company ID required" },
        { status: 400 }
      )
    }

    await db.query(
      "DELETE FROM lms_setting WHERE companyid = ?", 
      [company_id]
    )

    return NextResponse.json({ 
      success: true, 
      message: "LMS setting deleted" 
    })
  } catch (err) {
    console.error("LMS DELETE Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
