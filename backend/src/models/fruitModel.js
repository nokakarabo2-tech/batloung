const { pool } = require('../config/db');
const SIZES = ['SMALL', 'MEDIUM', 'LARGE'];
module.exports = {
  all: async () => (await pool.query("SELECT * FROM fruits ORDER BY fruit_name"))[0],
  available: async () => (await pool.query("SELECT * FROM fruits WHERE status='ACTIVE' ORDER BY fruit_name"))[0],
  byId: async (id) => (await pool.query('SELECT * FROM fruits WHERE fruit_id = ?', [id]))[0][0],
  // Creates the fruit AND its three stock rows (one per size) in one transaction
  create: async (f, prices) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [r] = await conn.query('INSERT INTO fruits (fruit_name, description) VALUES (?,?)', [f.fruit_name, f.description || null]);
      for (const size of SIZES) {
        await conn.query('INSERT INTO stock (fruit_id, packaging_size, available_quantity, selling_price) VALUES (?,?,0,?)',
          [r.insertId, size, prices[size] || 0]);
      }
      await conn.commit();
      return r.insertId;
    } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
  },
  update: async (id, f) => pool.query('UPDATE fruits SET fruit_name=?, description=?, status=? WHERE fruit_id=?',
    [f.fruit_name, f.description || null, f.status, id]),
  stockAll: async () => (await pool.query(
    `SELECT f.fruit_id, f.fruit_name, st.packaging_size, st.available_quantity, st.selling_price, st.low_stock_threshold
     FROM stock st JOIN fruits f ON f.fruit_id = st.fruit_id
     ORDER BY f.fruit_name, FIELD(st.packaging_size,'SMALL','MEDIUM','LARGE')`))[0],
  lowStock: async () => (await pool.query(
    `SELECT f.fruit_id, f.fruit_name, st.packaging_size, st.available_quantity, st.low_stock_threshold
     FROM stock st JOIN fruits f ON f.fruit_id = st.fruit_id
     WHERE st.available_quantity <= st.low_stock_threshold
     ORDER BY st.available_quantity`))[0],
  updateStockSettings: async (fruitId, size, price, threshold) => (await pool.query(
    `UPDATE stock SET selling_price = COALESCE(?, selling_price), low_stock_threshold = COALESCE(?, low_stock_threshold)
     WHERE fruit_id = ? AND packaging_size = ?`, [price, threshold, fruitId, size]))[0],
};
