const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isLoggedIn, isAdmin } = require('../middlewares/authMiddleware');

router.get('/orders', isLoggedIn, isAdmin, adminController.mostrarPedidos);

module.exports = router;