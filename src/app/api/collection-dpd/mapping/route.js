// app/api/collection-dpd/mapping/route.js

import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* =========================
   GET DPD MAPPINGS (with Master Table Join + Perfect Sorting)
========================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const company_id = searchParams.get("company_id")

    let condition = "WHERE m.deleted = 0"
    
    if (company_id && company_id !== "all") {
      condition += ` AND m.company_id = ${company_id}`
    }

    const [rows] = await db.query(`
      SELECT
        m.id,
        m.company_id,
        m.dpd_category_id,
        m.assigned_user_id,
        m.active,
        m.created_at,
        cat.dpd_category,
        cat.dpd_range,
        cat.start_dpd,
        cat.end_dpd,
        u.name AS user_name,
        u.email AS user_email,
        u.designation,
        COALESCE(b.name, 'All Brands') AS brand_name,
        COALESCE(b.code, 'GLOBAL') AS brand_code,
        GROUP_CONCAT(DISTINCT mrt.labels) AS user_roles
      FROM auto_collection_dpd_mapping m
      INNER JOIN master_collection_dpd_category cat 
        ON cat.id = m.dpd_category_id 
        AND cat.deleted = 0
      INNER JOIN users u 
        ON u.id = m.assigned_user_id 
        AND u.user_deleted = 0 
        AND u.user_active = 1
        AND u.user_status_id = 1
      LEFT JOIN master_brands b 
        ON b.id = m.company_id 
        AND b.deleted = 0
      LEFT JOIN user_roles ur 
        ON ur.user_id = u.id 
        AND ur.active = 1 
        AND ur.deleted = 0
      LEFT JOIN master_role_types mrt 
        ON mrt.id = ur.type_id 
        AND mrt.id = 15
      ${condition}
      GROUP BY
        m.id,
        m.company_id,
        m.dpd_category_id,
        m.assigned_user_id,
        m.active,
        m.created_at,
        cat.dpd_category,
        cat.dpd_range,
        cat.start_dpd,
        cat.end_dpd,
        u.name,
        u.email,
        u.designation,
        b.name,
        b.code
      ORDER BY 
        CASE WHEN m.company_id IS NULL THEN 0 ELSE 1 END,
        m.company_id ASC,
        CASE 
          WHEN cat.dpd_category = 'CS1' THEN 1
          WHEN cat.dpd_category = 'CS2' THEN 2
          WHEN cat.dpd_category = 'CS3' THEN 3
          WHEN cat.dpd_category = 'CS4' THEN 4
          WHEN cat.dpd_category = '90+' THEN 999
          WHEN cat.dpd_category LIKE 'CS%' THEN CAST(SUBSTRING(cat.dpd_category, 3) AS UNSIGNED)
          ELSE 1000
        END ASC,
        cat.start_dpd ASC
    `)

    return NextResponse.json({ success: true, data: rows })
  } catch (err) {
    console.error("COLLECTION DPD MAPPING GET ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   ADD DPD MAPPING (with Category ID + User Name in Error)
========================= */
export async function POST(req) {
  try {
    const { company_id, dpd_category_id, assigned_user_id } = await req.json()

    const finalCompanyId = (!company_id || company_id === "all") ? null : company_id

    // Validations
    if (!dpd_category_id) {
      return NextResponse.json(
        { success: false, message: "DPD category is required" },
        { status: 400 }
      )
    }

    if (!assigned_user_id) {
      return NextResponse.json(
        { success: false, message: "Collection officer is required" },
        { status: 400 }
      )
    }

    // ✅ Check if category exists and is active in master table
    const [category] = await db.query(
      `SELECT id, dpd_category, start_dpd, end_dpd 
       FROM master_collection_dpd_category 
       WHERE id = ? AND deleted = 0 AND active = 1`,
      [dpd_category_id]
    )

    if (category.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or inactive DPD category" },
        { status: 400 }
      )
    }

    // ✅ Check if user is a Collection Manager (CO2 - type_id = 15)
    const [userRoles] = await db.query(
      `SELECT ur.id 
       FROM user_roles ur 
       WHERE ur.user_id = ? 
         AND ur.type_id = 15
         AND ur.active = 1 
         AND ur.deleted = 0`,
      [assigned_user_id]
    )

    if (userRoles.length === 0) {
      return NextResponse.json(
        { success: false, message: "Selected user is not a Collection Manager (CO2)" },
        { status: 400 }
      )
    }

    // ✅ Check for duplicate: same company + same category + ACTIVE mapping (WITH USER NAME)
    let duplicateQuery = `
      SELECT 
        m.id, 
        u.name AS user_name, 
        cat.dpd_category,
        cat.dpd_range
      FROM auto_collection_dpd_mapping m
      INNER JOIN users u ON u.id = m.assigned_user_id
      INNER JOIN master_collection_dpd_category cat ON cat.id = m.dpd_category_id
      WHERE m.dpd_category_id = ?
        AND m.deleted = 0
        AND m.active = 1
    `
    const params = [dpd_category_id]

    if (finalCompanyId) {
      duplicateQuery += ` AND m.company_id = ?`
      params.push(finalCompanyId)
    } else {
      duplicateQuery += ` AND m.company_id IS NULL`
    }

    const [duplicate] = await db.query(duplicateQuery, params)

    if (duplicate.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `${duplicate[0].dpd_category} (${duplicate[0].dpd_range}) is already assigned to ${duplicate[0].user_name}` 
        },
        { status: 409 }
      )
    }

    // ✅ Insert mapping
    await db.query(
      `INSERT INTO auto_collection_dpd_mapping 
       (company_id, dpd_category_id, assigned_user_id) 
       VALUES (?, ?, ?)`,
      [finalCompanyId, dpd_category_id, assigned_user_id]
    )

    return NextResponse.json({
      success: true,
      message: `${category[0].dpd_category} mapping added successfully`,
    })
  } catch (err) {
    console.error("COLLECTION DPD MAPPING POST ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   UPDATE DPD MAPPING (Edit or Toggle Active/Inactive)
   Supports both:
   1. Toggle active status only: { id, active }
   2. Full edit: { id, company_id, dpd_category_id, assigned_user_id, active }
========================= */
export async function PUT(req) {
  try {
    const { id, company_id, dpd_category_id, assigned_user_id, active } = await req.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      )
    }

    // Check if mapping exists
    const [exists] = await db.query(
      `SELECT m.id, m.company_id, m.dpd_category_id, m.assigned_user_id, cat.dpd_category 
       FROM auto_collection_dpd_mapping m
       INNER JOIN master_collection_dpd_category cat ON cat.id = m.dpd_category_id
       WHERE m.id = ? AND m.deleted = 0`,
      [id]
    )

    if (exists.length === 0) {
      return NextResponse.json(
        { success: false, message: "Mapping not found" },
        { status: 404 }
      )
    }

    // ✅ CASE 1: TOGGLE ACTIVE STATUS ONLY
    if (active !== undefined && !dpd_category_id && !assigned_user_id) {
      await db.query(
        `UPDATE auto_collection_dpd_mapping 
         SET active = ?
         WHERE id = ?`,
        [active ? 1 : 0, id]
      )

      return NextResponse.json({
        success: true,
        message: `${exists[0].dpd_category} mapping ${active ? 'activated' : 'deactivated'} successfully`,
      })
    }

    // ✅ CASE 2: FULL EDIT WITH VALIDATIONS
    if (!dpd_category_id || !assigned_user_id) {
      return NextResponse.json(
        { success: false, message: "DPD category and Collection officer are required for edit" },
        { status: 400 }
      )
    }

    const finalCompanyId = company_id || exists[0].company_id

    // Check if category exists and is active
    const [category] = await db.query(
      `SELECT id, dpd_category, start_dpd, end_dpd 
       FROM master_collection_dpd_category 
       WHERE id = ? AND deleted = 0 AND active = 1`,
      [dpd_category_id]
    )

    if (category.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or inactive DPD category" },
        { status: 400 }
      )
    }

    // Check if user is CO2
    const [userRoles] = await db.query(
      `SELECT ur.id 
       FROM user_roles ur 
       WHERE ur.user_id = ? 
         AND ur.type_id = 15
         AND ur.active = 1 
         AND ur.deleted = 0`,
      [assigned_user_id]
    )

    if (userRoles.length === 0) {
      return NextResponse.json(
        { success: false, message: "Selected user is not a Collection Manager (CO2)" },
        { status: 400 }
      )
    }

    // ✅ Check for duplicate (exclude current record) WITH USER NAME
    let duplicateQuery = `
      SELECT 
        m.id, 
        u.name AS user_name, 
        cat.dpd_category,
        cat.dpd_range
      FROM auto_collection_dpd_mapping m
      INNER JOIN users u ON u.id = m.assigned_user_id
      INNER JOIN master_collection_dpd_category cat ON cat.id = m.dpd_category_id
      WHERE m.dpd_category_id = ?
        AND m.id != ?
        AND m.deleted = 0
        AND m.active = 1
    `
    const params = [dpd_category_id, id]

    if (finalCompanyId && finalCompanyId !== "all") {
      duplicateQuery += ` AND m.company_id = ?`
      params.push(finalCompanyId)
    } else {
      duplicateQuery += ` AND m.company_id IS NULL`
    }

    const [duplicate] = await db.query(duplicateQuery, params)

    if (duplicate.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `${duplicate[0].dpd_category} (${duplicate[0].dpd_range}) is already assigned to ${duplicate[0].user_name}` 
        },
        { status: 409 }
      )
    }

    // ✅ Update mapping with all fields
    await db.query(
      `UPDATE auto_collection_dpd_mapping 
       SET dpd_category_id = ?,
           assigned_user_id = ?,
           active = ?
       WHERE id = ?`,
      [dpd_category_id, assigned_user_id, active ?? 1, id]
    )

    return NextResponse.json({
      success: true,
      message: `${category[0].dpd_category} mapping updated successfully`,
    })
  } catch (err) {
    console.error("COLLECTION DPD MAPPING PUT ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE DPD MAPPING (Soft Delete)
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
      `SELECT m.id, cat.dpd_category 
       FROM auto_collection_dpd_mapping m
       INNER JOIN master_collection_dpd_category cat ON cat.id = m.dpd_category_id
       WHERE m.id = ? AND m.deleted = 0`,
      [id]
    )

    if (exists.length === 0) {
      return NextResponse.json(
        { success: false, message: "Mapping not found" },
        { status: 404 }
      )
    }

    // Soft delete
    await db.query(
      "UPDATE auto_collection_dpd_mapping SET deleted = 1 WHERE id = ?",
      [id]
    )

    return NextResponse.json({
      success: true,
      message: `${exists[0].dpd_category} mapping deleted successfully`,
    })
  } catch (err) {
    console.error("COLLECTION DPD MAPPING DELETE ERROR:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
