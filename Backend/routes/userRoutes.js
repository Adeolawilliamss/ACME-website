const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

//SUB MIDDLEWARE FOR THIS MINI-APPLICATION
const router = express.Router();

router.get('/', userController.getAllUsers);
router.post('/login', authController.login);
router.post('/signup', authController.signUp);
router.post('/logout', authController.logOut);
router.get('/isLoggedIn', authController.isLoggedIn);

module.exports = router;
