require('dotenv').config();
const mysql = require('mysql2/promise');

const ssl = process.env.DB_SSL === 'true'
  ? { minVersion: 'TLSv1.2' }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log('MySQL connected');
    return true;
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    return false;
  }
}

module.exports = { pool, testConnection };
