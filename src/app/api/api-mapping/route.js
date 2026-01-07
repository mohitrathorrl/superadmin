import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/* ================= GET: Fetch All Available APIs & Current Mappings ================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const brand_id = searchParams.get("brand_id")
    
    if (!brand_id) {
      return NextResponse.json(
        { success: false, message: "brand_id is required" },
        { status: 400 }
      )
    }
    
    // Get brand details
    const [[brand]] = await db.query(
      `SELECT id, name, code FROM master_brands WHERE id = ? AND deleted = 0`,
      [brand_id]
    )
    
    if (!brand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      )
    }
    
    // Get all available credentials (APIs) for this brand with mapping status
    const [credentials] = await db.query(
      `SELECT 
        c.id as credential_id,
        c.api_name,
        c.service_id,
        c.provider_id as default_provider_id,
        c.api_url,
        c.active,
        c.company_id,
        s.service_name,
        p.name as default_provider_name,
        COALESCE(m.id, 0) as mapping_id,
        COALESCE(m.provider_id, c.provider_id) as current_provider_id,
        COALESCE(mp.name, p.name) as current_provider_name,
        CASE 
          WHEN m.id IS NOT NULL THEN 1 
          ELSE 0 
        END as is_mapped
      FROM credentials c
      LEFT JOIN master_services s ON s.id = c.service_id
      LEFT JOIN providers p ON p.id = c.provider_id
      LEFT JOIN auto_api_provider_company_mapping m 
        ON m.api_id = c.id AND m.company_id = c.company_id
      LEFT JOIN providers mp ON mp.id = m.provider_id
      WHERE c.brand_id = ? 
        AND c.deleted = 0
      ORDER BY s.service_name ASC, c.api_name ASC`,
      [brand_id]
    )
    
    // Get all active providers
    const [providers] = await db.query(
      `SELECT id, name
       FROM providers 
       WHERE deleted = 0 AND active = 1
       ORDER BY name ASC`
    )
    
    return NextResponse.json({
      success: true,
      data: {
        brand: brand,
        credentials: credentials || [],
        providers: providers || [],
      },
    })
  } catch (err) {
    console.error("API Mapping GET Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

/* ================= POST: Add/Update/Delete Mapping ================= */
export async function POST(req) {
  try {
    const body = await req.json()
    const { action } = body
    
    // ✅ Toggle Mapping (Enable/Disable)
    if (action === "toggle_mapping") {
      const { credential_id, brand_id, provider_id, enable } = body
      
      if (!credential_id || !brand_id) {
        return NextResponse.json(
          { success: false, message: "credential_id and brand_id are required" },
          { status: 400 }
        )
      }
      
      // Get credential details to find company_id
      const [[credential]] = await db.query(
        `SELECT company_id, provider_id FROM credentials WHERE id = ? AND deleted = 0`,
        [credential_id]
      )
      
      if (!credential) {
        return NextResponse.json(
          { success: false, message: "Credential not found" },
          { status: 404 }
        )
      }
      
      // Check if mapping exists
      const [[existing]] = await db.query(
        `SELECT id, provider_id FROM auto_api_provider_company_mapping 
         WHERE company_id = ? AND api_id = ?`,
        [credential.company_id, credential_id]
      )
      
      if (enable) {
        // Enable: Add or update mapping
        const finalProviderId = provider_id || credential.provider_id
        
        if (existing) {
          // Update existing mapping
          await db.query(
            `UPDATE auto_api_provider_company_mapping 
             SET provider_id = ? 
             WHERE id = ?`,
            [finalProviderId, existing.id]
          )
          
          return NextResponse.json({
            success: true,
            message: "Provider updated successfully",
          })
        } else {
          // Add new mapping
          await db.query(
            `INSERT INTO auto_api_provider_company_mapping 
             (company_id, api_id, provider_id) 
             VALUES (?, ?, ?)`,
            [credential.company_id, credential_id, finalProviderId]
          )
          
          return NextResponse.json({
            success: true,
            message: "Mapping added successfully",
          })
        }
      } else {
        // Disable: Remove mapping
        if (existing) {
          await db.query(
            `DELETE FROM auto_api_provider_company_mapping WHERE id = ?`,
            [existing.id]
          )
          
          return NextResponse.json({
            success: true,
            message: "Mapping removed successfully",
          })
        }
        
        return NextResponse.json({
          success: true,
          message: "No mapping to remove",
        })
      }
    }
    
    // ✅ Change Provider for existing mapping
    if (action === "change_provider") {
      const { mapping_id, provider_id } = body
      
      if (!mapping_id || !provider_id) {
        return NextResponse.json(
          { success: false, message: "mapping_id and provider_id are required" },
          { status: 400 }
        )
      }
      
      await db.query(
        `UPDATE auto_api_provider_company_mapping 
         SET provider_id = ? 
         WHERE id = ?`,
        [provider_id, mapping_id]
      )
      
      return NextResponse.json({
        success: true,
        message: "Provider changed successfully",
      })
    }
    
    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    )
  } catch (err) {
    console.error("API Mapping POST Error:", err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
