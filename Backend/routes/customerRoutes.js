const express = require('express');
const authController = require('../controllers/authController');
const customerController = require('../controllers/customerController');

//SUB MIDDLEWARE FOR THIS MINI-APPLICATION
const router = express.Router();

// router.use(authController.protect);

router.post('/createCustomers', customerController.createCustomers);
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomer);

module.exports = router;
