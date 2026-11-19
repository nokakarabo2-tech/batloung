const Report = require('../models/reportModel');
const Fruit = require('../models/fruitModel');
const { HttpError } = require('../middleware/errorHandler');

exports.topFruits = async (req, res, next) => { try { res.json(await Report.topFruits()); } catch (e) { next(e); } };
exports.topVendor = async (req, res, next) => { try { res.json(await Report.topVendor()); } catch (e) { next(e); } };
exports.stockLevels = async (req, res, next) => { try { res.json(await Fruit.stockAll()); } catch (e) { next(e); } };
exports.revenue = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const ok = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
    if (!ok(from) || !ok(to)) throw new HttpError(400, 'Use ?from=YYYY-MM-DD&to=YYYY-MM-DD');
    if (from > to) throw new HttpError(400, '"from" must not be after "to".');
    res.json({ from, to, ...(await Report.revenue(from, to)) });
  } catch (e) { next(e); }
};
