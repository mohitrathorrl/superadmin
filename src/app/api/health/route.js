// src/app/api/health/route.js
import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db";

/**
 * Health Check API
 * GET /api/health
 * 
 * Tests database connection and returns system status
 */
export async function GET() {
  try {
    // Test database connection
    const dbStatus = await testConnection();

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: dbStatus,
        environment: process.env.NODE_ENV || "development",
        version: "2.1.0",
      },
      { status: dbStatus.success ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 }
    );
  }
}
