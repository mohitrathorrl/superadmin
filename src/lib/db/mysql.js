// lib/db/mysql.js - MySQL Database Connection with Query Helper
import mysql from 'mysql2/promise';

// ✅ Lazy-loaded connection pool
let pool = null;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: "sal@ryk@rt*&#2024",
      database: process.env.DB_NAME || 'lms_v2',
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    
    console.log('📊 MySQL pool created (mysql.js)');
  }
  return pool;
};

/**
 * Execute a SQL query
 * @param {Object} params - Query parameters
 * @param {string} params.query - SQL query string
 * @param {Array} params.values - Query values for prepared statements
 * @returns {Promise<Array>} Query results
 */
export async function query({ query, values = [] }) {
  try {
    const pool = getPool();
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('Query:', query);
    console.error('Values:', values);
    throw error;
  }
}

/**
 * Execute a transaction
 * @param {Function} callback - Transaction callback function
 * @returns {Promise<any>} Transaction result
 */
export async function transaction(callback) {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Transaction error:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Close the connection pool
 */
export async function closePool() {
  if (pool) {
    try {
      await pool.end();
      console.log('✅ MySQL connection pool closed');
      pool = null;
    } catch (error) {
      console.error('❌ Error closing pool:', error.message);
    }
  }
}

// Export pool getter
export const db = getPool();
export default getPool();
