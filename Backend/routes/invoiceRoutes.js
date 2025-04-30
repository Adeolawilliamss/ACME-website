const express = require('express');
const authController = require('../controllers/authController');
const invoiceController = require('../controllers/invoiceController');

//SUB MIDDLEWARE FOR THIS MINI-APPLICATION
const router = express.Router();

router.use(authController.protect);

router.post('/createInvoices', invoiceController.createInvoices);

router.get('/', invoiceController.getAllInvoices);
router.get('/cards', invoiceController.getInvoiceCardsData);
router.get('/LatestInvoices', invoiceController.getLatestInvoicesData);
router.get('/RevenueChart', invoiceController.getRevenue);
router.get('/filteredInvoice', invoiceController.fetchFilteredInvoices);
router.get('/search', invoiceController.filteredSearch);
router.get('/pages', invoiceController.fetchFilteredPages);
router.delete('/:id', invoiceController.deleteInvoice);
router.patch('/:id', invoiceController.updateInvoice);
router.get('/:id', invoiceController.getInvoice);

module.exports = router;
