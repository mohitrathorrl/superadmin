import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* ================= GET ================= */
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.id,
        b.name,
        b.code,
        b.domain_name,
        b.address_line1,
        b.address_line2,
        b.pin_code,
        b.nbfc_id,
        b.active,
        b.created_at,
        c.name AS nbfc_name,
        c.code AS nbfc_code
      FROM master_brands b
      LEFT JOIN master_companies c ON c.id = b.nbfc_id AND c.deleted = 0
      WHERE b.deleted = 0
      ORDER BY b.id ASC
    `)

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error("Brands GET Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch brands" },
      { status: 500 }
    )
  }
}

/* ================= ADD WITH AUTO CREATION ================= */
export async function POST(req) {
  try {
    const body = await req.json()
    const {
      name,
      code,
      domain_name,
      address_line1,
      address_line2,
      pin_code,
      nbfc_id,
    } = body

    // ... (all existing validation code remains same)

    // ✅ Insert brand with sanitized data
    const [result] = await db.query(
      `INSERT INTO master_brands
       (name, code, domain_name, address_line1, address_line2, pin_code, nbfc_id, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?, NOW(), NOW())`,
      [
        name.trim(),
        code.trim().toUpperCase(),
        domain_name.trim().toLowerCase(),
        address_line1.trim(),
        address_line2?.trim() || null,
        pin_code.trim(),
        nbfc_id,
      ]
    )

    const newBrandId = result.insertId

    // ✅✅ AUTO-CREATE DEFAULT DPD RULES
    const defaultDPDRules = [
      { name: 'Less than -10 DPD', start_dpd: -2000000, end_dpd: -10, percentage: 0 },
      { name: 'Between -9 to -5 DPD', start_dpd: -9, end_dpd: -5, percentage: 100 },
      { name: 'Between -4 to 0 DPD', start_dpd: -4, end_dpd: 0, percentage: 110 },
      { name: 'More than equals to 6 DPD', start_dpd: 6, end_dpd: 2000000, percentage: 0 },
    ]

    try {
      for (const rule of defaultDPDRules) {
        await db.query(
          `INSERT INTO auto_approved_dpd_percentage 
           (company_id, name, start_dpd, end_dpd, percentage)
           VALUES (?, ?, ?, ?, ?)`,
          [newBrandId, rule.name, rule.start_dpd, rule.end_dpd, rule.percentage]
        )
      }
    } catch (dpdError) {
      console.error("Failed to create default DPD rules:", dpdError)
    }

    // ✅✅ AUTO-CREATE DEFAULT FOIR RULES
    const defaultFOIRRules = [
      { category: 'CAT A', parameter: 'Official Mail + Owned House', s25_35: '66', s35_50: '45', s50: '55' },
      { category: 'CAT B', parameter: 'Official Mail Or Owned House', s25_35: '35', s35_50: '40', s50: '45' },
      { category: 'CAT C', parameter: 'Official Mail and Rental House', s25_35: '30', s35_50: '35', s50: '40' },
      { category: 'CAT X', parameter: 'Repeat with on time payment', s25_35: '50', s35_50: '50', s50: '50' },
    ]

    try {
      for (const rule of defaultFOIRRules) {
        await db.query(
          `INSERT INTO auto_foir_percentage 
           (company_id, category, parameter, moreThanEqualsto_25k_and_lessThan35k, moreThanEqualsto_35k_and_lessThan50k, moreThanEqualsto_50k)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [newBrandId, rule.category, rule.parameter, rule.s25_35, rule.s35_50, rule.s50]
        )
      }
    } catch (foirError) {
      console.error("Failed to create default FOIR rules:", foirError)
    }

    // ✅✅ AUTO-CREATE EMPTY WEBSITE SETTINGS
    try {
      await db.query(
        `INSERT INTO website_settings 
         (company_id, created_at, updated_at)
         VALUES (?, NOW(), NOW())`,
        [newBrandId]
      )
    } catch (settingsError) {
      console.error("Failed to create default website settings:", settingsError)
    }

    return NextResponse.json({ 
      success: true, 
      message: "Brand added successfully with default configurations" 
    })
  } catch (error) {
    console.error("Brands POST Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to add brand" },
      { status: 500 }
    )
  }
}

/* ================= UPDATE ================= */
// export async function PUT(req) {
//   // ... (existing PUT code remains same - no changes needed)
// }
export async function PUT(req) {
  try {
    const body = await req.json()
    const {
      id,
      name,
      code,
      domain_name,
      address_line1,
      address_line2,
      pin_code,
      nbfc_id,
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Brand ID is required" },
        { status: 400 }
      )
    }

    // ✅ Validate all required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Brand name is required" },
        { status: 400 }
      )
    }

    if (!code?.trim()) {
      return NextResponse.json(
        { success: false, message: "Brand code is required" },
        { status: 400 }
      )
    }

    if (!domain_name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Domain name is required" },
        { status: 400 }
      )
    }

    // ✅ Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain_name.trim())) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid domain name (e.g., example.com)" },
        { status: 400 }
      )
    }

    if (!address_line1?.trim()) {
      return NextResponse.json(
        { success: false, message: "Address line 1 is required" },
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

    // ✅ NBFC is now required
    if (!nbfc_id) {
      return NextResponse.json(
        { success: false, message: "Please select an NBFC" },
        { status: 400 }
      )
    }

    // ✅ Check if brand exists
    const [existing] = await db.query(
      `SELECT id FROM master_brands WHERE id = ? AND deleted = 0`,
      [id]
    )

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      )
    }

    // ✅ Verify NBFC exists
    const [nbfcExists] = await db.query(
      `SELECT id FROM master_companies WHERE id = ? AND deleted = 0`,
      [nbfc_id]
    )

    if (nbfcExists.length === 0) {
      return NextResponse.json(
        { success: false, message: "Selected NBFC does not exist" },
        { status: 400 }
      )
    }

    // ✅ Check if code already exists (excluding current brand)
    const [existingCode] = await db.query(
      `SELECT id FROM master_brands WHERE code = ? AND id != ? AND deleted = 0`,
      [code.trim().toUpperCase(), id]
    )

    if (existingCode.length > 0) {
      return NextResponse.json(
        { success: false, message: "Brand code already exists" },
        { status: 400 }
      )
    }

    // ✅ Check if domain already exists (excluding current brand)
    const [existingDomain] = await db.query(
      `SELECT id FROM master_brands WHERE domain_name = ? AND id != ? AND deleted = 0`,
      [domain_name.trim().toLowerCase(), id]
    )

    if (existingDomain.length > 0) {
      return NextResponse.json(
        { success: false, message: "Domain name already exists" },
        { status: 400 }
      )
    }

    // ✅ Update with sanitized data
    await db.query(
      `UPDATE master_brands
       SET name=?,
           code=?,
           domain_name=?,
           address_line1=?,
           address_line2=?,
           pin_code=?,
           nbfc_id=?,
           updated_at=NOW()
       WHERE id=?`,
      [
        name.trim(),
        code.trim().toUpperCase(),
        domain_name.trim().toLowerCase(),
        address_line1.trim(),
        address_line2?.trim() || null,
        pin_code.trim(),
        nbfc_id,
        id,
      ]
    )

    return NextResponse.json({ success: true, message: "Brand updated successfully" })
  } catch (error) {
    console.error("Brands PUT Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update brand" },
      { status: 500 }
    )
  }
}


/* ================= DELETE WITH FULL CLEANUP ================= */
export async function DELETE(req) {
  try {
    const id = new URL(req.url).searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Brand ID is required" },
        { status: 400 }
      )
    }

    // ✅ Check if brand exists
    const [existing] = await db.query(
      `SELECT id FROM master_brands WHERE id = ? AND deleted = 0`,
      [id]
    )

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      )
    }

    // ✅ Soft delete brand
    await db.query(
      "UPDATE master_brands SET deleted=1, deleted_at=NOW() WHERE id=?",
      [id]
    )

    // ✅✅ DELETE ASSOCIATED DPD RULES
    try {
      await db.query(
        "DELETE FROM auto_approved_dpd_percentage WHERE company_id = ?",
        [id]
      )
    } catch (dpdError) {
      console.error("Failed to delete DPD rules:", dpdError)
    }

    // ✅✅ DELETE ASSOCIATED FOIR RULES
    try {
      await db.query(
        "DELETE FROM auto_foir_percentage WHERE company_id = ?",
        [id]
      )
    } catch (foirError) {
      console.error("Failed to delete FOIR rules:", foirError)
    }

    // ✅✅ DELETE ASSOCIATED WEBSITE SETTINGS
    try {
      await db.query(
        "DELETE FROM website_settings WHERE company_id = ?",
        [id]
      )
    } catch (settingsError) {
      console.error("Failed to delete website settings:", settingsError)
    }

    return NextResponse.json({ 
      success: true, 
      message: "Brand and all associated configurations deleted successfully" 
    })
  } catch (error) {
    console.error("Brands DELETE Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete brand" },
      { status: 500 }
    )
  }
}
