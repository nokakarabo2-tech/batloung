const Fruit = require('../models/fruitModel');
const { HttpError } = require('../middleware/errorHandler');
const { SIZES } = require('../middleware/validate');

exports.create = async (req, res, next) => {
  try {
    const prices = req.body.prices || {}; // e.g. { SMALL: 80, MEDIUM: 140, LARGE: 220 }
    for (const s of SIZES) if (prices[s] !== undefined && !(Number(prices[s]) >= 0)) throw new HttpError(400, `Invalid ${s} price.`);
    const id = await Fruit.create(req.body, prices);
    res.status(201).json({ fruit_id: id, fruit_name: req.body.fruit_name });
  } catch (e) { next(e); }
};
exports.list = async (req, res, next) => { try { res.json(await Fruit.available()); } catch (e) { next(e); } };
exports.update = async (req, res, next) => {
  try {
    const old = await Fruit.byId(req.params.id);
    if (!old) throw new HttpError(404, 'Fruit not found.');
    const f = { ...old, ...req.body };
    if (!['ACTIVE', 'INACTIVE'].includes(f.status)) throw new HttpError(400, 'Status must be ACTIVE or INACTIVE.');
    await Fruit.update(req.params.id, f);
    res.json(f);
  } catch (e) { next(e); }
};
exports.stock = async (req, res, next) => { try { res.json(await Fruit.stockAll()); } catch (e) { next(e); } };
exports.lowStock = async (req, res, next) => { try { res.json(await Fruit.lowStock()); } catch (e) { next(e); } };
exports.updateStockSettings = async (req, res, next) => {
  try {
    const { fruitId, size } = req.params; const { selling_price, low_stock_threshold } = req.body;
    if (!SIZES.includes(size.toUpperCase())) throw new HttpError(400, 'Size must be SMALL, MEDIUM or LARGE.');
    if (selling_price === undefined && low_stock_threshold === undefined) throw new HttpError(400, 'Send selling_price and/or low_stock_threshold.');
    if (selling_price !== undefined && !(Number(selling_price) > 0)) throw new HttpError(400, 'selling_price must be above 0.');
    if (low_stock_threshold !== undefined && !(Number(low_stock_threshold) >= 0)) throw new HttpError(400, 'low_stock_threshold must be 0 or more.');
    const r = await Fruit.updateStockSettings(fruitId, size.toUpperCase(), selling_price ?? null, low_stock_threshold ?? null);
    if (!r.affectedRows) throw new HttpError(404, 'Stock record not found.');
    res.json({ message: 'Stock settings updated.' });
  } catch (e) { next(e); }
};
