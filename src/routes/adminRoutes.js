const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isLoggedIn, isAdmin } = require('../middlewares/authMiddleware');

router.get('/orders', isLoggedIn, isAdmin, adminController.mostrarPedidos);
router.get('/orders/:id', isLoggedIn, isAdmin, adminController.detallePedido);
// ...existing code...

module.exports = router;