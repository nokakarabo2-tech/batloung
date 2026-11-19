const { pool } = require('../config/db');
module.exports = {
  topFruits: async () => (await pool.query(
    `SELECT f.fruit_name, SUM(sd.quantity) AS boxes_sold FROM sales_details sd
     JOIN fruits f ON f.fruit_id = sd.fruit_id GROUP BY f.fruit_id, f.fruit_name ORDER BY boxes_sold DESC LIMIT 5`))[0],
  revenue: async (from, to) => (await pool.query(
    'SELECT COALESCE(SUM(total_amount),0) AS revenue, COUNT(*) AS sales_count FROM sales WHERE sale_date BETWEEN ? AND ?', [from, to]))[0][0],
  topVendor: async () => (await pool.query(
    `SELECT v.vendor_id, v.vendor_name, SUM(sd.quantity) AS boxes_bought FROM sales s
     JOIN vendors v ON v.vendor_id = s.vendor_id JOIN sales_details sd ON sd.sale_id = s.sale_id
     GROUP BY v.vendor_id, v.vendor_name ORDER BY boxes_bought DESC LIMIT 1`))[0][0] || null,
};
