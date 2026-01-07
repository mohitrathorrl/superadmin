import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* ================= GET: Fetch All Providers with Services ================= */
export async function GET(req) {
  try {
    const [providers] = await db.query(
      `SELECT id, name, active, deleted 
       FROM providers 
       WHERE deleted = 0 
       ORDER BY name ASC`
    )
    
    return NextResponse.json({
      success: true,
      data: providers || [],
    })
  } catch (err) {
    console.error("Providers GET Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* ================= POST: Add/Update Provider ================= */
export async function POST(req) {
  try {
    const body = await req.json()
    const { action, id, name, active } = body
    
    if (action === "add") {
      if (!name) {
        return NextResponse.json(
          { success: false, message: "Provider name is required" },
          { status: 400 }
        )
      }
      
      await db.query(
        `INSERT INTO providers (name, active) 
         VALUES (?, ?)`,
        [name, active ? 1 : 0]
      )
      
      return NextResponse.json({
        success: true,
        message: "Provider added successfully",
      })
    }
    
    if (action === "update") {
      if (!id || !name) {
        return NextResponse.json(
          { success: false, message: "ID and name are required" },
          { status: 400 }
        )
      }
      
      await db.query(
        `UPDATE providers 
         SET name = ?, active = ? 
         WHERE id = ?`,
        [name, active ? 1 : 0, id]
      )
      
      return NextResponse.json({
        success: true,
        message: "Provider updated successfully",
      })
    }
    
    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    )
  } catch (err) {
    console.error("Providers POST Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* ================= DELETE: Soft Delete Provider ================= */
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
      `UPDATE providers 
       SET deleted = 1, deleted_at = NOW() 
       WHERE id = ?`,
      [id]
    )
    
    return NextResponse.json({
      success: true,
      message: "Provider deleted successfully",
    })
  } catch (err) {
    console.error("Providers DELETE Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
