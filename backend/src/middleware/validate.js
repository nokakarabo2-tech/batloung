const { HttpError } = require('./errorHandler');
const SIZES = ['SMALL', 'MEDIUM', 'LARGE'];
const PROVINCES = ['Gauteng','Free State','KwaZulu-Natal','Western Cape','Eastern Cape','Limpopo','Mpumalanga','North West'];

// Checks that listed body fields are present and not blank
const requireFields = (...fields) => (req, res, next) => {
  const missing = fields.filter((f) => req.body[f] === undefined || String(req.body[f]).trim() === '');
  if (missing.length) return next(new HttpError(400, `Missing required field(s): ${missing.join(', ')}`));
  next();
};

const validId = (req, res, next) => {
  for (const key of Object.keys(req.params)) {
    if (key.endsWith('Id') || key === 'id') {
      if (!/^\d+$/.test(req.params[key])) return next(new HttpError(400, `Invalid ${key}`));
    }
  }
  next();
};

const isPhone = (p) => /^[+\d\s-]{7,20}$/.test(String(p));
const isPositiveInt = (n) => Number.isInteger(n) && n > 0;
const isPositiveNum = (n) => typeof n === 'number' && Number.isFinite(n) && n > 0;

module.exports = { requireFields, validId, isPhone, isPositiveInt, isPositiveNum, SIZES, PROVINCES };
