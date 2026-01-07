import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* ================= GET LEADS WITH FILTERS + PAGINATION ================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const company_id = searchParams.get("company_id")
    const status = searchParams.get("status")
    const stage = searchParams.get("stage")
    const search = searchParams.get("search") // mobile/pan/email/lead_id search
    const page = parseInt(searchParams.get("page")) || 1
    const limit = parseInt(searchParams.get("limit")) || 50
    const offset = (page - 1) * limit
    
    let query = `
      SELECT 
        l.id,
        l.application_no,
        l.loan_no,
        l.first_name,
        l.middle_name,
        l.surname,
        l.pancard,
        l.mobile,
        l.email,
        l.applied_amount,
        l.applied_tenure,
        l.status,
        l.stage,
        l.lead_status_id,
        l.lead_entry_date,
        l.created_at,
        l.updated_at,
        b.name AS brand_name,
        b.code AS brand_code,
        ms.status_name,
        ms.status_stage
      FROM leads l
      LEFT JOIN master_brands b ON b.id = l.brand_id AND b.deleted = 0
      LEFT JOIN master_status ms ON ms.id = l.lead_status_id AND ms.status_deleted = 0
      WHERE l.deleted = 0
    `
    
    const params = []
    
    if (company_id) {
      query += " AND l.brand_id = ?"
      params.push(company_id)
    }
    
    if (status) {
      query += " AND l.status = ?"
      params.push(status)
    }
    
    if (stage) {
      query += " AND l.stage = ?"
      params.push(stage)
    }
    
    // ✅ Search by Lead ID, Mobile, PAN, Email
    if (search) {
      query += " AND (l.id = ? OR l.mobile LIKE ? OR l.pancard LIKE ? OR l.email LIKE ?)"
      const leadId = isNaN(search) ? 0 : parseInt(search)
      const searchParam = `%${search}%`
      params.push(leadId, searchParam, searchParam, searchParam)
    }
    
    // ✅ Get total count for pagination
    const countQuery = query.replace(/SELECT[\s\S]+?FROM/, "SELECT COUNT(*) as total FROM")
    const [[{ total }]] = await db.query(countQuery, params)
    
    // ✅ Add pagination
    query += " ORDER BY l.id DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)
    
    const [rows] = await db.query(query, params)

    return NextResponse.json({
      success: true,
      data: rows || [],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error("Leads GET Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* ================= POST: UPDATE STATUS/STAGE + GET STATUSES ================= */
export async function POST(req) {
  try {
    const body = await req.json()
    const { action, company_id, lead_id, new_status_id } = body
    
    // ✅ Get Available Statuses
    if (action === "get_statuses") {
      let query = `
        SELECT DISTINCT 
          ms.id,
          ms.status_name,
          ms.status_stage,
          COUNT(l.id) as count
        FROM master_status ms
        LEFT JOIN leads l ON l.lead_status_id = ms.id AND l.deleted = 0
      `
      
      const params = []
      
      if (company_id) {
        query += " AND l.brand_id = ?"
        params.push(company_id)
      }
      
      query += `
        WHERE ms.status_deleted = 0
        GROUP BY ms.id, ms.status_name, ms.status_stage
        ORDER BY ms.id ASC
      `
      
      const [rows] = await db.query(query, params)
      
      return NextResponse.json({
        success: true,
        data: rows || [],
      })
    }
    
    // ✅ Update Lead Status/Stage
    if (action === "update_status") {
      if (!lead_id || !new_status_id) {
        return NextResponse.json(
          { success: false, message: "lead_id and new_status_id required" },
          { status: 400 }
        )
      }
      
      // Get new status details from master_status
      const [[statusData]] = await db.query(
        `SELECT status_name, status_stage FROM master_status WHERE id = ? AND status_deleted = 0`,
        [new_status_id]
      )
      
      if (!statusData) {
        return NextResponse.json(
          { success: false, message: "Invalid status_id" },
          { status: 400 }
        )
      }
      
      // Update lead table
      await db.query(
        `UPDATE leads 
         SET lead_status_id = ?, 
             status = ?, 
             stage = ?,
             updated_at = NOW()
         WHERE id = ? AND deleted = 0`,
        [new_status_id, statusData.status_name, statusData.status_stage, lead_id]
      )
      
      return NextResponse.json({
        success: true,
        message: "Status updated successfully",
      })
    }
    
    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    )
  } catch (err) {
    console.error("Leads POST Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
