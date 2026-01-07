import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* ================= GET ================= */
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        code,
        registration_no,
        address_line1,
        address_line2,
        pin_code,
        grievance_officer_details,
        active,
        created_at
      FROM master_companies
      WHERE deleted = 0
      ORDER BY id DESC
    `)

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error("NBFC GET Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch NBFCs" },
      { status: 500 }
    )
  }
}

/* ================= ADD ================= */
export async function POST(req) {
  try {
    const body = await req.json()
    const {
      name,
      code,
      registration_no,
      address_line1,
      address_line2,
      pin_code,
      grievance_officer_details,
    } = body

    // ✅ Validate all required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "NBFC name is required" },
        { status: 400 }
      )
    }

    if (!code?.trim()) {
      return NextResponse.json(
        { success: false, message: "NBFC code is required" },
        { status: 400 }
      )
    }

    if (!registration_no?.trim()) {
      return NextResponse.json(
        { success: false, message: "Registration number is required" },
        { status: 400 }
      )
    }

    if (!address_line1?.trim()) {
      return NextResponse.json(
        { success: false, message: "Address line 1 is required" },
        { status: 400 }
      )
    }

    if (!address_line2?.trim()) {
      return NextResponse.json(
        { success: false, message: "Address line 2 is required" },
        { status: 400 }
      )
    }

    if (!pin_code?.trim()) {
      return NextResponse.json(
        { success: false, message: "Pin code is required" },
        { status: 400 }
      )
    }

    // ✅ Validate pin code format (6 digits)
    if (!/^\d{6}$/.test(pin_code.trim())) {
      return NextResponse.json(
        { success: false, message: "Pin code must be exactly 6 digits" },
        { status: 400 }
      )
    }

    if (!grievance_officer_details?.trim()) {
      return NextResponse.json(
        { success: false, message: "Grievance officer details are required" },
        { status: 400 }
      )
    }

    // ✅ Check if code already exists
    const [existingCode] = await db.query(
      `SELECT id FROM master_companies WHERE code = ? AND deleted = 0`,
      [code.trim().toUpperCase()]
    )

    if (existingCode.length > 0) {
      return NextResponse.json(
        { success: false, message: "NBFC code already exists" },
        { status: 400 }
      )
    }

    // ✅ Check if registration number already exists
    const [existingReg] = await db.query(
      `SELECT id FROM master_companies WHERE registration_no = ? AND deleted = 0`,
      [registration_no.trim()]
    )

    if (existingReg.length > 0) {
      return NextResponse.json(
        { success: false, message: "Registration number already exists" },
        { status: 400 }
      )
    }

    // ✅ Insert with sanitized data
    await db.query(
      `INSERT INTO master_companies
       (name, code, registration_no, address_line1, address_line2, pin_code, grievance_officer_details, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?, NOW(), NOW())`,
      [
        name.trim(),
        code.trim().toUpperCase(),
        registration_no.trim(),
        address_line1.trim(),
        address_line2.trim(),
        pin_code.trim(),
        grievance_officer_details.trim(),
      ]
    )

    return NextResponse.json({ success: true, message: "NBFC added successfully" })
  } catch (error) {
    console.error("NBFC POST Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to add NBFC" },
      { status: 500 }
    )
  }
}

/* ================= UPDATE ================= */
export async function PUT(req) {
  try {
    const body = await req.json()
    const {
      id,
      name,
      code,
      registration_no,
      address_line1,
      address_line2,
      pin_code,
      grievance_officer_details,
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: "NBFC ID is required" },
        { status: 400 }
      )
    }

    // ✅ Validate all required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "NBFC name is required" },
        { status: 400 }
      )
    }

    if (!code?.trim()) {
      return NextResponse.json(
        { success: false, message: "NBFC code is required" },
        { status: 400 }
      )
    }

    if (!registration_no?.trim()) {
      return NextResponse.json(
        { success: false, message: "Registration number is required" },
        { status: 400 }
      )
    }

    if (!address_line1?.trim()) {
      return NextResponse.json(
        { success: false, message: "Address line 1 is required" },
        { status: 400 }
      )
    }

    if (!address_line2?.trim()) {
      return NextResponse.json(
        { success: false, message: "Address line 2 is required" },
        { status: 400 }
      )
    }

    if (!pin_code?.trim()) {
      return NextResponse.json(
        { success: false, message: "Pin code is required" },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(pin_code.trim())) {
      return NextResponse.json(
        { success: false, message: "Pin code must be exactly 6 digits" },
        { status: 400 }
      )
    }

    if (!grievance_officer_details?.trim()) {
      return NextResponse.json(
        { success: false, message: "Grievance officer details are required" },
        { status: 400 }
      )
    }

    // ✅ Check if NBFC exists
    const [existing] = await db.query(
      `SELECT id FROM master_companies WHERE id = ? AND deleted = 0`,
      [id]
    )

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "NBFC not found" },
        { status: 404 }
      )
    }

    // ✅ Check if code already exists (excluding current NBFC)
    const [existingCode] = await db.query(
      `SELECT id FROM master_companies WHERE code = ? AND id != ? AND deleted = 0`,
      [code.trim().toUpperCase(), id]
    )

    if (existingCode.length > 0) {
      return NextResponse.json(
        { success: false, message: "NBFC code already exists" },
        { status: 400 }
      )
    }

    // ✅ Check if registration number already exists (excluding current NBFC)
    const [existingReg] = await db.query(
      `SELECT id FROM master_companies WHERE registration_no = ? AND id != ? AND deleted = 0`,
      [registration_no.trim(), id]
    )

    if (existingReg.length > 0) {
      return NextResponse.json(
        { success: false, message: "Registration number already exists" },
        { status: 400 }
      )
    }

    // ✅ Update with sanitized data
    await db.query(
      `UPDATE master_companies
       SET
         name=?,
         code=?,
         registration_no=?,
         address_line1=?,
         address_line2=?,
         pin_code=?,
         grievance_officer_details=?,
         updated_at=NOW()
       WHERE id=?`,
      [
        name.trim(),
        code.trim().toUpperCase(),
        registration_no.trim(),
        address_line1.trim(),
        address_line2.trim(),
        pin_code.trim(),
        grievance_officer_details.trim(),
        id,
      ]
    )

    return NextResponse.json({ success: true, message: "NBFC updated successfully" })
  } catch (error) {
    console.error("NBFC PUT Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update NBFC" },
      { status: 500 }
    )
  }
}

/* ================= DELETE (SOFT) ================= */
export async function DELETE(req) {
  try {
    const id = new URL(req.url).searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, message: "NBFC ID is required" },
        { status: 400 }
      )
    }

    // ✅ Check if NBFC exists
    const [existing] = await db.query(
      `SELECT id FROM master_companies WHERE id = ? AND deleted = 0`,
      [id]
    )

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "NBFC not found" },
        { status: 404 }
      )
    }

    // ✅ Check if any brands are linked to this NBFC
    const [linkedBrands] = await db.query(
      `SELECT COUNT(*) as count FROM master_brands WHERE nbfc_id = ? AND deleted = 0`,
      [id]
    )

    if (linkedBrands[0].count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete NBFC. ${linkedBrands[0].count} brand(s) are linked to this NBFC. Please reassign or delete them first.` 
        },
        { status: 400 }
      )
    }

    // ✅ Soft delete
    await db.query(
      "UPDATE master_companies SET deleted = 1, deleted_at = NOW() WHERE id = ?",
      [id]
    )

    return NextResponse.json({ success: true, message: "NBFC deleted successfully" })
  } catch (error) {
    console.error("NBFC DELETE Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete NBFC" },
      { status: 500 }
    )
  }
}
