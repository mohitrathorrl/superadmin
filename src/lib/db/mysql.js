// lib/db/mysql.js - MySQL Database Connection
import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'salarykart_lms',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection on startup
pool.getConnection()
  .then((connection) => {
    console.log('✅ MySQL Database connected successfully!');
    connection.release();
  })
  .catch((error) => {
    console.error('❌ MySQL Database connection failed:', error.message);
  });

/**
 * Execute a SQL query
 * @param {Object} params - Query parameters
 * @param {string} params.query - SQL query string
 * @param {Array} params.values - Query values for prepared statements
 * @returns {Promise<Array>} Query results
 */
export async function query({ query, values = [] }) {
  try {
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
  try {
    await pool.end();
    console.log('✅ MySQL connection pool closed');
  } catch (error) {
    console.error('❌ Error closing pool:', error.message);
  }
}

export default pool;
