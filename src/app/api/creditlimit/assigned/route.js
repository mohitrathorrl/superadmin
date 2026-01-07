import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* =========================
   GET ASSIGNED CREDIT LIMITS
========================= */
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        cl.id,
        cl.user_id,
        u.name,
        u.designation,
        cl.max_limit
      FROM auto_credit_user_loan_limit cl
      INNER JOIN users u ON u.id = cl.user_id
      ORDER BY cl.id DESC
    `)

    return NextResponse.json({
      success: true,
      data: rows,
    })
  } catch (err) {
    console.error("CREDIT LIMIT GET ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   ADD CREDIT LIMIT
========================= */
export async function POST(req) {
  try {
    const { user_id, max_limit } = await req.json()

    /* ===== VALIDATIONS ===== */
    if (!user_id) {
      return NextResponse.json(
        { success: false, message: "User is required" },
        { status: 400 }
      )
    }

    // ✅ allow 0, block negative & invalid
    if (max_limit === undefined || isNaN(max_limit) || Number(max_limit) < 0) {
      return NextResponse.json(
        { success: false, message: "Credit limit must be 0 or greater" },
        { status: 400 }
      )
    }

    /* ===== DUPLICATE CHECK ===== */
    const [exists] = await db.query(
      "SELECT id FROM auto_credit_user_loan_limit WHERE user_id=?",
      [user_id]
    )

    if (exists.length > 0) {
      return NextResponse.json(
        { success: false, message: "Credit limit already assigned to this user" },
        { status: 409 }
      )
    }

    /* ===== INSERT ===== */
    await db.query(
      "INSERT INTO auto_credit_user_loan_limit (user_id, max_limit) VALUES (?,?)",
      [user_id, Number(max_limit)]
    )

    return NextResponse.json({
      success: true,
      message: "Credit limit added successfully",
    })
  } catch (err) {
    console.error("CREDIT LIMIT POST ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   UPDATE CREDIT LIMIT
========================= */
export async function PUT(req) {
  try {
    const { id, max_limit } = await req.json()

    /* ===== VALIDATIONS ===== */
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      )
    }

    // ✅ allow 0
    if (max_limit === undefined || isNaN(max_limit) || Number(max_limit) < 0) {
      return NextResponse.json(
        { success: false, message: "Credit limit must be 0 or greater" },
        { status: 400 }
      )
    }

    /* ===== CHECK EXISTS ===== */
    const [exists] = await db.query(
      "SELECT id FROM auto_credit_user_loan_limit WHERE id=?",
      [id]
    )

    if (exists.length === 0) {
      return NextResponse.json(
        { success: false, message: "Credit limit record not found" },
        { status: 404 }
      )
    }

    /* ===== UPDATE ===== */
    await db.query(
      "UPDATE auto_credit_user_loan_limit SET max_limit=? WHERE id=?",
      [Number(max_limit), id]
    )

    return NextResponse.json({
      success: true,
      message: "Credit limit updated successfully",
    })
  } catch (err) {
    console.error("CREDIT LIMIT PUT ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE CREDIT LIMIT
========================= */
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

    const [exists] = await db.query(
      "SELECT id FROM auto_credit_user_loan_limit WHERE id=?",
      [id]
    )

    if (exists.length === 0) {
      return NextResponse.json(
        { success: false, message: "Credit limit record not found" },
        { status: 404 }
      )
    }

    await db.query(
      "DELETE FROM auto_credit_user_loan_limit WHERE id=?",
      [id]
    )

    return NextResponse.json({
      success: true,
      message: "Credit limit deleted successfully",
    })
  } catch (err) {
    console.error("CREDIT LIMIT DELETE ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
