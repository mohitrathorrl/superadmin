import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* ================= GET: Fetch Provider Services ================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const provider_id = searchParams.get("provider_id")
    
    if (!provider_id) {
      // Get all provider-service mappings
      const [mappings] = await db.query(
        `SELECT pps.id, pps.provider_id, pps.service_id, 
                p.name as provider_name, ms.service_name
         FROM provider_services pps
         LEFT JOIN providers p ON p.id = pps.provider_id
         LEFT JOIN master_services ms ON ms.id = pps.service_id
         WHERE pps.deleted = 0
         ORDER BY p.name, ms.service_name`
      )
      
      return NextResponse.json({
        success: true,
        data: mappings || [],
      })
    }
    
    // Get services for specific provider
    const [services] = await db.query(
      `SELECT pps.id, pps.service_id, ms.service_name
       FROM provider_services pps
       LEFT JOIN master_services ms ON ms.id = pps.service_id
       WHERE pps.provider_id = ? AND pps.deleted = 0
       ORDER BY ms.service_name`,
      [provider_id]
    )
    
    return NextResponse.json({
      success: true,
      data: services || [],
    })
  } catch (err) {
    console.error("Provider Services GET Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* ================= POST: Add Service to Provider ================= */
export async function POST(req) {
  try {
    const body = await req.json()
    const { provider_id, service_id } = body
    
    if (!provider_id || !service_id) {
      return NextResponse.json(
        { success: false, message: "Provider ID and Service ID are required" },
        { status: 400 }
      )
    }
    
    // Check if already exists
    const [[existing]] = await db.query(
      `SELECT id FROM provider_services 
       WHERE provider_id = ? AND service_id = ? AND deleted = 0`,
      [provider_id, service_id]
    )
    
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Service already mapped to this provider" },
        { status: 400 }
      )
    }
    
    await db.query(
      `INSERT INTO provider_services (provider_id, service_id) 
       VALUES (?, ?)`,
      [provider_id, service_id]
    )
    
    return NextResponse.json({
      success: true,
      message: "Service mapped to provider successfully",
    })
  } catch (err) {
    console.error("Provider Services POST Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* ================= DELETE: Remove Service from Provider ================= */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      )
    }
    
    await db.query(
      `UPDATE provider_services 
       SET deleted = 1, deleted_at = NOW() 
       WHERE id = ?`,
      [id]
    )
    
    return NextResponse.json({
      success: true,
      message: "Service removed from provider successfully",
    })
  } catch (err) {
    console.error("Provider Services DELETE Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
