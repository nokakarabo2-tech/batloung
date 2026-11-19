const router = require('express').Router();
const { requireFields, validId } = require('../middleware/validate');
const sup = require('../controllers/supplierController');
const fruit = require('../controllers/fruitController');
const vendor = require('../controllers/vendorController');
const purchase = require('../controllers/purchaseController');
const sale = require('../controllers/saleController');
const report = require('../controllers/reportController');
const { pool } = require('../config/db');

router.get('/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ api: 'ok', database: 'ok' }); }
  catch { res.status(503).json({ api: 'ok', database: 'down' }); }
});

// Suppliers
router.post('/suppliers', requireFields('business_name', 'contact_person', 'phone', 'province', 'address'), sup.create);
router.get('/suppliers', sup.list);
router.get('/suppliers/:id', validId, sup.get);
router.put('/suppliers/:id', validId, requireFields('business_name', 'contact_person', 'phone', 'province', 'address'), sup.update);
router.delete('/suppliers/:id', validId, sup.remove);

// Fruits and stock
router.post('/fruits', requireFields('fruit_name'), fruit.create);
router.get('/fruits', fruit.list);
router.put('/fruits/:id', validId, fruit.update);
router.get('/stock', fruit.stock);
router.get('/stock/low', fruit.lowStock);
router.put('/stock/:fruitId/:size', validId, fruit.updateStockSettings);

// Vendors
router.post('/vendors', requireFields('vendor_name', 'phone_number', 'location'), vendor.create);
router.get('/vendors', vendor.list); // ?search=name or phone
router.get('/vendors/balances', vendor.balances);
router.get('/vendors/:id', validId, vendor.get);
router.get('/vendors/:id/balance', validId, vendor.balance);
router.put('/vendors/:id', validId, requireFields('vendor_name', 'phone_number', 'location'), vendor.update);

// Purchases and sales
router.post('/purchases', purchase.create);
router.get('/purchases', purchase.list);
router.get('/purchases/:id', validId, purchase.get);
router.post('/sales', sale.create);
router.get('/sales', sale.list);
router.get('/sales/:id', validId, sale.get);
router.post('/sales/:id/payments', validId, sale.pay);

// Reports
router.get('/reports/top-fruits', report.topFruits);
router.get('/reports/revenue', report.revenue);
router.get('/reports/top-vendor', report.topVendor);
router.get('/reports/stock-levels', report.stockLevels);

module.exports = router;
