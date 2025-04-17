const express = require('express');
const router = express.Router();
const loginController = require('../controllers/authController');

router.get('/login', loginController.login);
router.post('/auth/login', loginController.auth);
router.get('/register', loginController.register);
router.post('/register', loginController.storeUser);
router.get('/logout', loginController.logout);
router.get('/home', loginController.home);
router.get('/admin/dashboard', loginController.admindashboard);


module.exports = router;
