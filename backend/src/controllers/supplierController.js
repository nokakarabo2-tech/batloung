const Supplier = require('../models/supplierModel');
const { HttpError } = require('../middleware/errorHandler');
const { isPhone, PROVINCES } = require('../middleware/validate');

function check(b) {
  if (!isPhone(b.phone)) throw new HttpError(400, 'Phone number is not valid.');
  if (!PROVINCES.includes(b.province)) throw new HttpError(400, `Province must be one of: ${PROVINCES.join(', ')}`);
}

exports.create = async (req, res, next) => {
  try { check(req.body); const id = await Supplier.create(req.body); res.status(201).json({ supplier_id: id, ...req.body }); }
  catch (e) { next(e); }
};
exports.list = async (req, res, next) => { try { res.json(await Supplier.all()); } catch (e) { next(e); } };
exports.get = async (req, res, next) => {
  try { const s = await Supplier.byId(req.params.id); if (!s) throw new HttpError(404, 'Supplier not found.'); res.json(s); }
  catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
  try {
    if (!(await Supplier.byId(req.params.id))) throw new HttpError(404, 'Supplier not found.');
    check(req.body); await Supplier.update(req.params.id, req.body);
    res.json({ supplier_id: Number(req.params.id), ...req.body });
  } catch (e) { next(e); }
};
exports.remove = async (req, res, next) => {
  try {
    if (!(await Supplier.byId(req.params.id))) throw new HttpError(404, 'Supplier not found.');
    // Business rule: suppliers with purchase history cannot be deleted
    if ((await Supplier.purchaseCount(req.params.id)) > 0) throw new HttpError(409, 'Cannot delete: this supplier has purchase records.');
    await Supplier.remove(req.params.id);
    res.json({ message: 'Supplier deleted.' });
  } catch (e) { next(e); }
};
