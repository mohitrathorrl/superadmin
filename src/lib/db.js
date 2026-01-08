// src/lib/db.js
import mysql from "mysql2/promise";

// ✅ Create connection pool (lazy loaded - only connects when first query runs)
let pool = null;

export const getDbPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: "sal@ryk@rt*&#2024",
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Log pool creation (not connection attempt)
    console.log("📊 MySQL connection pool created");
  }
  return pool;
};

// Export pool getter as default db - THIS IS CRITICAL!
export const db = getDbPool();

// Also export as default for flexibility
export default db;

// ✅ Health check function (call this from API route, not on import)
export async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("✅ MySQL Database connected successfully");
    connection.release();
    return { success: true, message: "Database connected" };
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    return { success: false, message: err.message };
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  if (pool) {
    await pool.end();
    console.log("🔌 Database pool closed");
  }
});
