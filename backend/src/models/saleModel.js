const { pool } = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');

// Calculates the sale total from quantity x selling price of each size
const calcTotal = (lines) => lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
const statusFor = (total, paid) => (paid <= 0 ? 'UNPAID' : paid >= total ? 'PAID' : 'PARTIALLY_PAID');

module.exports = {
  create: async ({ vendor_id, items, amount_paid = 0, method }) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();                                    // BEGIN
      const [[vendor]] = await conn.query('SELECT vendor_id FROM vendors WHERE vendor_id = ?', [vendor_id]);
      if (!vendor) throw new HttpError(404, 'Vendor not found.');
      const lines = [];
      for (const [i, it] of items.entries()) {
        // FOR UPDATE locks the row so two sales cannot take the same boxes
        const [[st]] = await conn.query(
          'SELECT available_quantity, selling_price FROM stock WHERE fruit_id=? AND packaging_size=? FOR UPDATE',
          [it.fruit_id, it.packaging_size]);
        if (!st) throw new HttpError(404, `Item ${i + 1}: no stock record for this fruit and size.`);
        if (st.available_quantity < it.quantity)
          throw new HttpError(400, `Item ${i + 1}: only ${st.available_quantity} ${it.packaging_size} box(es) available, ${it.quantity} requested. Sale rejected.`);
        if (st.selling_price <= 0) throw new HttpError(400, `Item ${i + 1}: no selling price set for this size.`);
        await conn.query('UPDATE stock SET available_quantity = available_quantity - ? WHERE fruit_id=? AND packaging_size=?',
          [it.quantity, it.fruit_id, it.packaging_size]);               // stock goes DOWN
        lines.push({ ...it, unit_price: st.selling_price });
      }
      const total = calcTotal(lines);
      if (amount_paid > total) throw new HttpError(400, `Payment (${amount_paid}) is more than the total (${total}).`);
      const [s] = await conn.query('INSERT INTO sales (vendor_id, payment_status, total_amount, amount_paid) VALUES (?,?,?,?)',
        [vendor_id, statusFor(total, amount_paid), total, amount_paid]);
      for (const l of lines)
        await conn.query('INSERT INTO sales_details (sale_id, fruit_id, packaging_size, quantity, unit_price) VALUES (?,?,?,?,?)',
          [s.insertId, l.fruit_id, l.packaging_size, l.quantity, l.unit_price]);
      if (amount_paid > 0)
        await conn.query('INSERT INTO payments (sale_id, amount, method) VALUES (?,?,?)', [s.insertId, amount_paid, method]);
      await conn.commit();                                              // COMMIT
      return { sale_id: s.insertId, total_amount: total, amount_paid, outstanding_balance: total - amount_paid,
               payment_status: statusFor(total, amount_paid), items: lines };
    } catch (e) { await conn.rollback(); throw e; }                     // ROLLBACK
    finally { conn.release(); }
  },
  addPayment: async (saleId, amount, method) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [[sale]] = await conn.query('SELECT total_amount, amount_paid FROM sales WHERE sale_id = ? FOR UPDATE', [saleId]);
      if (!sale) throw new HttpError(404, 'Sale not found.');
      const owing = sale.total_amount - sale.amount_paid;
      if (amount > owing) throw new HttpError(400, `Payment is more than the balance owing (${owing}).`);
      const paid = sale.amount_paid + amount;
      await conn.query('INSERT INTO payments (sale_id, amount, method) VALUES (?,?,?)', [saleId, amount, method]);
      await conn.query('UPDATE sales SET amount_paid=?, payment_status=? WHERE sale_id=?', [paid, statusFor(sale.total_amount, paid), saleId]);
      await conn.commit();
      return { sale_id: Number(saleId), amount_paid: paid, outstanding_balance: sale.total_amount - paid, payment_status: statusFor(sale.total_amount, paid) };
    } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
  },
  all: async () => (await pool.query(
    `SELECT s.*, v.vendor_name, (s.total_amount - s.amount_paid) AS outstanding_balance
     FROM sales s JOIN vendors v ON v.vendor_id = s.vendor_id ORDER BY s.sale_id DESC`))[0],
  byId: async (id) => {
    const [[s]] = await pool.query(
      `SELECT s.*, v.vendor_name, (s.total_amount - s.amount_paid) AS outstanding_balance
       FROM sales s JOIN vendors v ON v.vendor_id=s.vendor_id WHERE sale_id = ?`, [id]);
    if (!s) return null;
    const [items] = await pool.query('SELECT sd.*, f.fruit_name FROM sales_details sd JOIN fruits f ON f.fruit_id=sd.fruit_id WHERE sale_id = ?', [id]);
    const [payments] = await pool.query('SELECT * FROM payments WHERE sale_id = ? ORDER BY paid_at', [id]);
    return { ...s, items, payments };
  },
};
