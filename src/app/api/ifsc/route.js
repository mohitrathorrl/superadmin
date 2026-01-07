import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/* =========================
   HELPERS
========================= */
const isValidIFSC = (ifsc) =>
  /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)

const clean = (v) =>
  typeof v === "string" ? v.trim() : null

const requiredCheck = (obj, fields) =>
  fields.filter((f) => !obj[f])

/* =========================
   GET – LIST / SEARCH / SINGLE
========================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const ifsc = clean(searchParams.get("ifsc"))
    const search = clean(searchParams.get("search"))
    const page = Math.max(+searchParams.get("page") || 1, 1)
    const limit = Math.min(+searchParams.get("limit") || 10, 50)
    const offset = (page - 1) * limit

    /* ---- SINGLE IFSC ---- */
    if (ifsc) {
      if (!isValidIFSC(ifsc))
        return NextResponse.json(
          { success: false, message: "Invalid IFSC format" },
          { status: 400 }
        )

      const [rows] = await db.query(
        `
        SELECT id, name, ifsc, branch, address, city, district, state
        FROM master_bank_details
        WHERE ifsc = ? AND deleted = 0
        LIMIT 1
        `,
        [ifsc]
      )

      return NextResponse.json({
        success: true,
        data: rows[0] || null,
      })
    }

    /* ---- SEARCH BUILD ---- */
    let where = `WHERE deleted = 0 AND active = 1`
    let params = []

    if (search) {
      if (/^[A-Z]{4}0/i.test(search)) {
        where += ` AND ifsc LIKE ?`
        params.push(`${search}%`)
      } else {
        where += `
          AND MATCH(name, branch, city)
          AGAINST (? IN BOOLEAN MODE)
        `
        params.push(`${search}*`)
      }
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) total FROM master_bank_details ${where}`,
      params
    )

    const [rows] = await db.query(
      `
      SELECT id, name, ifsc, branch, address, city, district, state
      FROM master_bank_details
      ${where}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    )

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      hasNext: offset + rows.length < total,
      data: rows,
    })
  } catch (err) {
    console.error("GET IFSC ERROR:", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}

/* =========================
   POST – ADD BANK (STRICT)
========================= */
export async function POST(req) {
  try {
    const body = await req.json()

    const payload = {
      name: clean(body.name),
      ifsc: clean(body.ifsc),
      branch: clean(body.branch),
      address: clean(body.address),
      city: clean(body.city),
      district: clean(body.district),
      state: clean(body.state),
    }

    const missing = requiredCheck(payload, Object.keys(payload))
    if (missing.length) {
      return NextResponse.json(
        { success: false, message: `Missing fields: ${missing.join(", ")}` },
        { status: 400 }
      )
    }

    if (!isValidIFSC(payload.ifsc)) {
      return NextResponse.json(
        { success: false, message: "Invalid IFSC format" },
        { status: 400 }
      )
    }

    const [dup] = await db.query(
      `SELECT id FROM master_bank_details WHERE ifsc = ? AND deleted = 0`,
      [payload.ifsc]
    )

    if (dup.length) {
      return NextResponse.json(
        { success: false, message: "IFSC already exists" },
        { status: 409 }
      )
    }

    const [result] = await db.query(
      `
      INSERT INTO master_bank_details
      (name, ifsc, branch, address, city, district, state, active, deleted, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())
      `,
      Object.values(payload)
    )

    return NextResponse.json({
      success: true,
      message: "Bank added successfully",
      id: result.insertId,
    })
  } catch (err) {
    console.error("ADD BANK ERROR:", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}

/* =========================
   PUT – UPDATE BANK (STRICT)
========================= */
export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = Number(searchParams.get("id"))

    if (!id)
      return NextResponse.json(
        { success: false, message: "Bank id required" },
        { status: 400 }
      )

    const body = await req.json()

    const payload = {
      name: clean(body.name),
      ifsc: clean(body.ifsc),
      branch: clean(body.branch),
      address: clean(body.address),
      city: clean(body.city),
      district: clean(body.district),
      state: clean(body.state),
    }

    const missing = requiredCheck(payload, Object.keys(payload))
    if (missing.length) {
      return NextResponse.json(
        { success: false, message: `Missing fields: ${missing.join(", ")}` },
        { status: 400 }
      )
    }

    if (!isValidIFSC(payload.ifsc)) {
      return NextResponse.json(
        { success: false, message: "Invalid IFSC format" },
        { status: 400 }
      )
    }

    const [bank] = await db.query(
      `SELECT id FROM master_bank_details WHERE id = ? AND deleted = 0`,
      [id]
    )

    if (!bank.length)
      return NextResponse.json(
        { success: false, message: "Bank not found" },
        { status: 404 }
      )

    const [dup] = await db.query(
      `
      SELECT id FROM master_bank_details
      WHERE ifsc = ? AND id != ? AND deleted = 0
      `,
      [payload.ifsc, id]
    )

    if (dup.length) {
      return NextResponse.json(
        { success: false, message: "IFSC already exists" },
        { status: 409 }
      )
    }

    await db.query(
      `
      UPDATE master_bank_details SET
        name = ?, ifsc = ?, branch = ?, address = ?, city = ?,
        district = ?, state = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [...Object.values(payload), id]
    )

    return NextResponse.json({
      success: true,
      message: "Bank updated successfully",
    })
  } catch (err) {
    console.error("UPDATE BANK ERROR:", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE – SAFE SOFT DELETE
========================= */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = Number(searchParams.get("id"))

    if (!id)
      return NextResponse.json(
        { success: false, message: "Bank id required" },
        { status: 400 }
      )

    const [bank] = await db.query(
      `SELECT id FROM master_bank_details WHERE id = ? AND deleted = 0`,
      [id]
    )

    if (!bank.length)
      return NextResponse.json(
        { success: false, message: "Bank not found or already deleted" },
        { status: 404 }
      )

    await db.query(
      `
      UPDATE master_bank_details
      SET deleted = 1, active = 0, deleted_at = NOW()
      WHERE id = ?
      `,
      [id]
    )

    return NextResponse.json({
      success: true,
      message: "Bank deleted successfully",
    })
  } catch (err) {
    console.error("DELETE BANK ERROR:", err)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
