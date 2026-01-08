// src/lib/db.js
import mysql from "mysql2/promise";

// ✅ Create connection pool (lazy loaded - only connects when first query runs)
let pool = null;

export const getDbPool = () => {
  if (!pool) {
    // Validate required environment variables
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars.join(', '));
      console.error('📝 Please check your .env.local file');
    }

    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Log pool creation (not connection attempt)
    console.log("📊 MySQL connection pool created");
    console.log("📍 Config: {");
    console.log(`    host: ${process.env.DB_HOST}`);
    console.log(`    user: ${process.env.DB_USER}`);
    console.log(`    database: ${process.env.DB_NAME}`);
    console.log(`    password: ${process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'NOT SET'}`);
    console.log("  }");
  }
  return pool;
};

// Export pool getter as default db
export const db = getDbPool();

// ✅ Health check function (call this from API route, not on import)
export async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("✅ MySQL Database connected successfully");
    
    // Test query
    await connection.query('SELECT 1');
    connection.release();
    
    return { 
      success: true, 
      message: "Database connected",
      config: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME
      }
    };
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    console.error("📝 Debug Info:");
    console.error(`   Host: ${process.env.DB_HOST}`);
    console.error(`   User: ${process.env.DB_USER}`);
    console.error(`   Database: ${process.env.DB_NAME}`);
    console.error(`   Password set: ${process.env.DB_PASSWORD ? 'YES (last 4 chars: ***' + process.env.DB_PASSWORD.slice(-4) + ')' : 'NO'}`);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check if MySQL is running: systemctl status mysql");
    console.error("   2. Verify user exists: SELECT User FROM mysql.user WHERE User='salarykart_admin';");
    console.error("   3. Check grants: SHOW GRANTS FOR 'salarykart_admin'@'localhost';");
    console.error("   4. Test login: mysql -u salarykart_admin -p lms_v2");
    console.error("   5. See DB_TEST.md for complete troubleshooting guide");
    
    return { 
      success: false, 
      message: err.message,
      code: err.code,
      sqlState: err.sqlState
    };
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  if (pool) {
    await pool.end();
    console.log("🔌 Database pool closed");
  }
});
