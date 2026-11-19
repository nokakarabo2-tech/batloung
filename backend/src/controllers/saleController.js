const Sale = require('../models/saleModel');
const { HttpError } = require('../middleware/errorHandler');
const { SIZES, isPositiveInt, isPositiveNum } = require('../middleware/validate');

const METHODS = ['CASH', 'MOBILE_MONEY'];

exports.create = async (req, res, next) => {
  try {
    const { vendor_id, items, amount_paid = 0, method } = req.body;
    if (!Number.isInteger(vendor_id)) throw new HttpError(400, 'vendor_id must be a number.');
    if (!Array.isArray(items) || !items.length) throw new HttpError(400, 'items must be a non-empty array.');
    items.forEach((it, i) => {
      if (!Number.isInteger(it.fruit_id)) throw new HttpError(400, `Item ${i + 1}: fruit_id is invalid.`);
      if (!SIZES.includes(it.packaging_size)) throw new HttpError(400, `Item ${i + 1}: packaging_size must be SMALL, MEDIUM or LARGE.`);
      if (!isPositiveInt(it.quantity)) throw new HttpError(400, `Item ${i + 1}: quantity must be a whole number above 0.`);
    });
    if (typeof amount_paid !== 'number' || amount_paid < 0) throw new HttpError(400, 'amount_paid must be 0 or more.');
    if (amount_paid > 0 && !METHODS.includes(method)) throw new HttpError(400, 'method must be CASH or MOBILE_MONEY when a payment is made.');
    res.status(201).json(await Sale.create({ vendor_id, items, amount_paid, method }));
  } catch (e) { next(e); }
};
exports.pay = async (req, res, next) => {
  try {
    const { amount, method } = req.body;
    if (!isPositiveNum(amount)) throw new HttpError(400, 'amount must be above 0.');
    if (!METHODS.includes(method)) throw new HttpError(400, 'method must be CASH or MOBILE_MONEY.');
    res.json(await Sale.addPayment(req.params.id, amount, method));
  } catch (e) { next(e); }
};
exports.list = async (req, res, next) => { try { res.json(await Sale.all()); } catch (e) { next(e); } };
exports.get = async (req, res, next) => {
  try { const s = await Sale.byId(req.params.id); if (!s) throw new HttpError(404, 'Sale not found.'); res.json(s); } catch (e) { next(e); }
};
