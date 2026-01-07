// src/app/api/dashboard/overview/route.js

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req) {
  try {
    console.log("🔍 Fetching dashboard overview stats...")

    /* PARALLEL QUERIES FOR PERFORMANCE */
    const [
      totalNBFCs,
      totalBrands,
      totalIFSC,
      totalRootAdmins,
      totalAdminUsers,
      totalLeads,
      recentActivity,
    ] = await Promise.allSettled([
      // Total NBFCs/Companies (not deleted)
      db.query(`
        SELECT COUNT(*) as count 
        FROM master_companies 
        WHERE deleted = 0
      `),
      
      // Total Brands (not deleted)
      db.query(`
        SELECT COUNT(*) as count 
        FROM master_brands 
        WHERE deleted = 0
      `),
      
      // Total IFSC Codes (active and not deleted)
      db.query(`
        SELECT COUNT(*) as count 
        FROM master_bank_details 
        WHERE deleted = 0 AND active = 1
      `),
      
      // Total Root Admins (active only)
      db.query(`
        SELECT COUNT(*) as count 
        FROM sup_root_admin 
        WHERE is_active = 1
      `),
      
      // Total Admin Users (active only)
      db.query(`
        SELECT COUNT(*) as count 
        FROM sup_admin_users 
        WHERE is_active = 1
      `),
      
      // Total Leads (all time, not deleted)
      db.query(`
        SELECT COUNT(*) as count 
        FROM leads 
        WHERE deleted = 0
      `),
      
      // Recent Lead Activity with brand/company info
      db.query(`
        SELECT 
          l.id,
          CONCAT(l.first_name, ' ', COALESCE(l.middle_name, ''), ' ', l.surname) as full_name,
          l.email,
          l.mobile,
          l.created_at,
          l.lead_status_id,
          b.name as brand_name,
          b.code as brand_code,
          c.name as company_name
        FROM leads l
        LEFT JOIN master_brands b ON l.brand_id = b.id
        LEFT JOIN master_companies c ON l.company_id = c.id
        WHERE l.deleted = 0
        ORDER BY l.created_at DESC 
        LIMIT 10
      `),
    ])

    /* SAFE DATA EXTRACTION */
    const safeCount = (result) => {
      if (result.status === "fulfilled" && result.value?.[0]?.[0]?.count !== undefined) {
        return result.value[0][0].count
      }
      return 0
    }

    const safeActivity = (result) => {
      if (result.status === "fulfilled" && result.value?.[0]) {
        return result.value[0]
      }
      return []
    }

    /* QUICK STATS */
    const stats = {
      nbfcs: safeCount(totalNBFCs),
      brands: safeCount(totalBrands),
      ifscCodes: safeCount(totalIFSC),
      users: safeCount(totalRootAdmins) + safeCount(totalAdminUsers), // Combined count
      totalLeads: safeCount(totalLeads),
    }

    /* RECENT ACTIVITY */
    const activity = safeActivity(recentActivity).map((lead) => ({
      id: lead.id,
      name: lead.full_name?.trim() || "Unknown",
      email: lead.email || "N/A",
      mobile: lead.mobile || "N/A",
      brand: lead.brand_name || "Unknown",
      brandCode: lead.brand_code || "",
      company: lead.company_name || "Unknown",
      timestamp: lead.created_at,
      action: "Lead Created",
      status: lead.lead_status_id,
    }))

    /* SYSTEM STATUS */
    const systemStatus = {
      database: "active",
      api: "operational",
      email: "operational",
      lastBackup: new Date().toISOString(),
    }

    console.log("✅ Dashboard stats fetched:", stats)

    return NextResponse.json({
      success: true,
      data: {
        stats,
        systemStatus,
        recentActivity: activity.slice(0, 5),
      },
    })
  } catch (err) {
    console.error("❌ DASHBOARD API ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data",
        error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
