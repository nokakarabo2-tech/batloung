const { pool } = require('../config/db');
module.exports = {
  all: async () => (await pool.query('SELECT * FROM vendors ORDER BY vendor_name'))[0],
  search: async (q) => (await pool.query('SELECT * FROM vendors WHERE vendor_name LIKE ? OR phone_number LIKE ?', [`%${q}%`, `%${q}%`]))[0],
  byId: async (id) => (await pool.query('SELECT * FROM vendors WHERE vendor_id = ?', [id]))[0][0],
  create: async (v) => (await pool.query('INSERT INTO vendors (vendor_name, phone_number, location) VALUES (?,?,?)',
    [v.vendor_name, v.phone_number, v.location]))[0].insertId,
  update: async (id, v) => pool.query('UPDATE vendors SET vendor_name=?, phone_number=?, location=? WHERE vendor_id=?',
    [v.vendor_name, v.phone_number, v.location, id]),
  balances: async (id = null) => (await pool.query(
    `SELECT v.vendor_id, v.vendor_name, v.phone_number,
            COALESCE(SUM(s.total_amount),0) AS total_billed,
            COALESCE(SUM(s.amount_paid),0) AS total_paid,
            COALESCE(SUM(s.total_amount - s.amount_paid),0) AS outstanding_balance
     FROM vendors v LEFT JOIN sales s ON s.vendor_id = v.vendor_id
     ${id ? 'WHERE v.vendor_id = ?' : ''}
     GROUP BY v.vendor_id, v.vendor_name, v.phone_number
     ORDER BY outstanding_balance DESC`, id ? [id] : []))[0],
};
