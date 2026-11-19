const Vendor = require('../models/vendorModel');
const { HttpError } = require('../middleware/errorHandler');
const { isPhone } = require('../middleware/validate');

exports.create = async (req, res, next) => {
  try {
    if (!isPhone(req.body.phone_number)) throw new HttpError(400, 'Phone number is not valid.');
    const id = await Vendor.create(req.body);
    res.status(201).json({ vendor_id: id, ...req.body });
  } catch (e) { next(e); }
};
exports.list = async (req, res, next) => {
  try { res.json(req.query.search ? await Vendor.search(req.query.search) : await Vendor.all()); } catch (e) { next(e); }
};
exports.get = async (req, res, next) => {
  try { const v = await Vendor.byId(req.params.id); if (!v) throw new HttpError(404, 'Vendor not found.'); res.json(v); } catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
  try {
    if (!(await Vendor.byId(req.params.id))) throw new HttpError(404, 'Vendor not found.');
    if (!isPhone(req.body.phone_number)) throw new HttpError(400, 'Phone number is not valid.');
    await Vendor.update(req.params.id, req.body);
    res.json({ vendor_id: Number(req.params.id), ...req.body });
  } catch (e) { next(e); }
};
exports.balances = async (req, res, next) => { try { res.json(await Vendor.balances()); } catch (e) { next(e); } };
exports.balance = async (req, res, next) => {
  try { const [b] = await Vendor.balances(req.params.id); if (!b) throw new HttpError(404, 'Vendor not found.'); res.json(b); } catch (e) { next(e); }
};
