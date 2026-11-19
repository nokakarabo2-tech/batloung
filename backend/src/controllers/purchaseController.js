const Purchase = require('../models/purchaseModel');
const { HttpError } = require('../middleware/errorHandler');
const { SIZES, isPositiveInt, isPositiveNum } = require('../middleware/validate');

exports.create = async (req, res, next) => {
  try {
    const { supplier_id, items } = req.body;
    if (!Number.isInteger(supplier_id)) throw new HttpError(400, 'supplier_id must be a number.');
    if (!Array.isArray(items) || !items.length) throw new HttpError(400, 'items must be a non-empty array.');
    items.forEach((it, i) => {
      if (!Number.isInteger(it.fruit_id)) throw new HttpError(400, `Item ${i + 1}: fruit_id is invalid.`);
      if (!SIZES.includes(it.packaging_size)) throw new HttpError(400, `Item ${i + 1}: packaging_size must be SMALL, MEDIUM or LARGE.`);
      if (!isPositiveInt(it.quantity)) throw new HttpError(400, `Item ${i + 1}: quantity must be a whole number above 0.`);
      if (!isPositiveNum(it.unit_cost)) throw new HttpError(400, `Item ${i + 1}: unit_cost must be above 0.`);
    });
    res.status(201).json(await Purchase.create(supplier_id, items));
  } catch (e) { next(e); }
};
exports.list = async (req, res, next) => { try { res.json(await Purchase.all()); } catch (e) { next(e); } };
exports.get = async (req, res, next) => {
  try { const p = await Purchase.byId(req.params.id); if (!p) throw new HttpError(404, 'Purchase not found.'); res.json(p); } catch (e) { next(e); }
};
