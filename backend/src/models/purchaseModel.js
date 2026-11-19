const { pool } = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');

module.exports = {
  // All-or-nothing: if any item fails, ROLLBACK leaves purchases and stock untouched
  create: async (supplierId, items) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();                        // BEGIN
      const [[sup]] = await conn.query('SELECT supplier_id FROM suppliers WHERE supplier_id = ?', [supplierId]);
      if (!sup) throw new HttpError(404, 'Supplier not found.');
      const [p] = await conn.query('INSERT INTO purchases (supplier_id, total_amount) VALUES (?, 0)', [supplierId]);
      let total = 0;
      for (const [i, it] of items.entries()) {
        const [[fruit]] = await conn.query("SELECT status FROM fruits WHERE fruit_id = ?", [it.fruit_id]);
        if (!fruit) throw new HttpError(404, `Item ${i + 1}: fruit ${it.fruit_id} not found.`);
        if (fruit.status !== 'ACTIVE') throw new HttpError(400, `Item ${i + 1}: fruit is inactive.`);
        await conn.query('INSERT INTO purchase_details (purchase_id, fruit_id, quantity, unit_cost, packaging_size) VALUES (?,?,?,?,?)',
          [p.insertId, it.fruit_id, it.quantity, it.unit_cost, it.packaging_size]);
        await conn.query(
          `INSERT INTO stock (fruit_id, packaging_size, available_quantity) VALUES (?,?,?)
           ON DUPLICATE KEY UPDATE available_quantity = available_quantity + VALUES(available_quantity)`,
          [it.fruit_id, it.packaging_size, it.quantity]);     // stock goes UP
        total += it.quantity * it.unit_cost;
      }
      await conn.query('UPDATE purchases SET total_amount = ? WHERE purchase_id = ?', [total, p.insertId]);
      await conn.commit();                                  // COMMIT
      return { purchase_id: p.insertId, total_amount: total };
    } catch (e) { await conn.rollback(); throw e; }         // ROLLBACK
    finally { conn.release(); }
  },
  all: async () => (await pool.query(
    `SELECT p.*, s.business_name FROM purchases p JOIN suppliers s ON s.supplier_id = p.supplier_id ORDER BY p.purchase_id DESC`))[0],
  byId: async (id) => {
    const [[p]] = await pool.query('SELECT p.*, s.business_name FROM purchases p JOIN suppliers s ON s.supplier_id=p.supplier_id WHERE purchase_id = ?', [id]);
    if (!p) return null;
    const [items] = await pool.query('SELECT pd.*, f.fruit_name FROM purchase_details pd JOIN fruits f ON f.fruit_id=pd.fruit_id WHERE purchase_id = ?', [id]);
    return { ...p, items };
  },
};
