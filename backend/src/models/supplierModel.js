const { pool } = require('../config/db');
module.exports = {
  all: async () => (await pool.query('SELECT * FROM suppliers ORDER BY business_name'))[0],
  byId: async (id) => (await pool.query('SELECT * FROM suppliers WHERE supplier_id = ?', [id]))[0][0],
  create: async (s) => {
    const [r] = await pool.query(
      'INSERT INTO suppliers (business_name, contact_person, phone, province, address) VALUES (?,?,?,?,?)',
      [s.business_name, s.contact_person, s.phone, s.province, s.address]);
    return r.insertId;
  },
  update: async (id, s) => pool.query(
    'UPDATE suppliers SET business_name=?, contact_person=?, phone=?, province=?, address=? WHERE supplier_id=?',
    [s.business_name, s.contact_person, s.phone, s.province, s.address, id]),
  purchaseCount: async (id) => (await pool.query('SELECT COUNT(*) AS n FROM purchases WHERE supplier_id = ?', [id]))[0][0].n,
  remove: async (id) => pool.query('DELETE FROM suppliers WHERE supplier_id = ?', [id]),
};
