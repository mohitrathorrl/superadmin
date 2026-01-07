import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* ================= GET: Fetch All Services ================= */
export async function GET(req) {
  try {
    const [services] = await db.query(
      `SELECT id, service_name, active, deleted 
       FROM master_services 
       WHERE deleted = 0 
       ORDER BY service_name ASC`
    )
    
    return NextResponse.json({
      success: true,
      data: services || [],
    })
  } catch (err) {
    console.error("Services GET Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* ================= POST: Add/Update Service ================= */
export async function POST(req) {
  try {
    const body = await req.json()
    const { action, id, service_name, active } = body
    
    if (action === "add") {
      if (!service_name) {
        return NextResponse.json(
          { success: false, message: "Service name is required" },
          { status: 400 }
        )
      }
      
      await db.query(
        `INSERT INTO master_services (service_name, active) 
         VALUES (?, ?)`,
        [service_name, active ? 1 : 0]
      )
      
      return NextResponse.json({
        success: true,
        message: "Service added successfully",
      })
    }
    
    if (action === "update") {
      if (!id || !service_name) {
        return NextResponse.json(
          { success: false, message: "ID and service name are required" },
          { status: 400 }
        )
      }
      
      await db.query(
        `UPDATE master_services 
         SET service_name = ?, active = ? 
         WHERE id = ?`,
        [service_name, active ? 1 : 0, id]
      )
      
      return NextResponse.json({
        success: true,
        message: "Service updated successfully",
      })
    }
    
    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    )
  } catch (err) {
    console.error("Services POST Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* ================= DELETE: Soft Delete Service ================= */
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
      `UPDATE master_services 
       SET deleted = 1, deleted_at = NOW() 
       WHERE id = ?`,
      [id]
    )
    
    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    })
  } catch (err) {
    console.error("Services DELETE Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
