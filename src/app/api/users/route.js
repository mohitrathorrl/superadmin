import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/* =========================
   READ (ROOT + USERS + COUNT)
========================= */
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        name,
        email,
        is_active,
        created_at,
        1 AS is_root
      FROM sup_root_admin

      UNION ALL

      SELECT
        id,
        name,
        email,
        is_active,
        created_at,
        0 AS is_root
      FROM sup_admin_users

      ORDER BY created_at DESC
    `)

    const [[count]] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM sup_root_admin) +
        (SELECT COUNT(*) FROM sup_admin_users)
        AS total
    `)

    return NextResponse.json({
      data: rows,
      total: count.total,
    })
  } catch (err) {
    console.error("GET USERS ERROR:", err)
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

/* =========================
   CREATE (ONLY ADMIN USER)
========================= */
export async function POST(req) {
  try {
    const { name, email } = await req.json()

    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and Email required" },
        { status: 400 }
      )
    }

    await db.query(
      `
      INSERT INTO sup_admin_users
      (name, email, is_active, created_at)
      VALUES (?, ?, 1, NOW())
      `,
      [name, email]
    )

    return NextResponse.json({ message: "User created successfully" })
  } catch (err) {
    console.error("CREATE USER ERROR:", err)
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    )
  }
}

/* =========================
   UPDATE (ADMIN USER ONLY)
========================= */
export async function PUT(req) {
  try {
    const { id, name, is_active, is_root } = await req.json()

    if (!id) {
      return NextResponse.json(
        { message: "User ID required" },
        { status: 400 }
      )
    }

    if (is_root) {
      return NextResponse.json(
        { message: "Root user cannot be updated" },
        { status: 403 }
      )
    }

    await db.query(
      `
      UPDATE sup_admin_users
      SET name = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [name, is_active, id]
    )

    return NextResponse.json({ message: "User updated successfully" })
  } catch (err) {
    console.error("UPDATE USER ERROR:", err)
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE (ADMIN USER ONLY)
========================= */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const isRoot = searchParams.get("is_root")

    if (!id) {
      return NextResponse.json(
        { message: "User ID required" },
        { status: 400 }
      )
    }

    if (isRoot === "1") {
      return NextResponse.json(
        { message: "Root user cannot be deleted" },
        { status: 403 }
      )
    }

    await db.query(
      "DELETE FROM sup_admin_users WHERE id = ?",
      [id]
    )

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (err) {
    console.error("DELETE USER ERROR:", err)
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 }
    )
  }
}
