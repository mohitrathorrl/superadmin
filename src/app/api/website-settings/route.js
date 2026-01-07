import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* =========================
   GET WEBSITE SETTINGS (WITH COMPANY FILTER)
========================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const company_id = searchParams.get("company_id")
    
    let query = "SELECT * FROM website_settings"
    let params = []
    
    if (company_id) {
      query += " WHERE company_id = ?"
      params.push(company_id)
    }
    
    query += " ORDER BY id DESC LIMIT 1"
    
    const [rows] = await db.query(query, params)

    return NextResponse.json({
      success: true,
      data: rows[0] || {},
    })
  } catch (err) {
    console.error("Website Settings GET Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   UPDATE WEBSITE SETTINGS WITH COMPANY_ID
========================= */
export async function PUT(req) {
  try {
    const body = await req.json()

    const {
      company_id,
      whatsapp_no = "",
      instagram = "",
      care_no = "",
      care_support_email = "",
      facebook = "",
      telegram = "",
      linkedin = "",
      youtube = "",
    } = body

    // ✅ Validate company_id
    if (!company_id) {
      return NextResponse.json(
        { success: false, message: "Brand is required" },
        { status: 400 }
      )
    }

    // ✅ Check if settings exist for this brand
    const [existing] = await db.query(
      "SELECT id FROM website_settings WHERE company_id = ?",
      [company_id]
    )

    if (existing.length > 0) {
      // ✅ Update existing settings
      await db.query(
        `UPDATE website_settings SET
          whatsapp_no = ?,
          instagram = ?,
          care_no = ?,
          care_support_email = ?,
          facebook = ?,
          telegram = ?,
          linkedin = ?,
          youtube = ?,
          updated_at = NOW()
        WHERE company_id = ?`,
        [
          whatsapp_no,
          instagram,
          care_no,
          care_support_email,
          facebook,
          telegram,
          linkedin,
          youtube,
          company_id,
        ]
      )
    } else {
      // ✅ Create new settings if not exist
      await db.query(
        `INSERT INTO website_settings 
         (company_id, whatsapp_no, instagram, care_no, care_support_email, facebook, telegram, linkedin, youtube, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          company_id,
          whatsapp_no,
          instagram,
          care_no,
          care_support_email,
          facebook,
          telegram,
          linkedin,
          youtube,
        ]
      )
    }

    return NextResponse.json({
      success: true,
      message: "Website settings updated successfully",
    })
  } catch (err) {
    console.error("Website Settings PUT Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
