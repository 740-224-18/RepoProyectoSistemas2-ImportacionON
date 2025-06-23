const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isLoggedIn, isAdmin } = require('../middlewares/authMiddleware');

router.get('/orders', isLoggedIn, isAdmin, adminController.mostrarPedidos);
router.get('/orders/:id', isLoggedIn, isAdmin, adminController.detallePedido);
router.post('/orders/:id/completar', isLoggedIn, isAdmin, adminController.completarPedido);
router.get('/orders_completed', isLoggedIn, isAdmin, adminController.pedidosCompletados);
router.get('/orders/:id/pdf', isLoggedIn, isAdmin, adminController.descargarPedidoPDF);
router.get('/dashboard', isLoggedIn, isAdmin, adminController.dashboard);
router.get('/historial_inventario', isLoggedIn, isAdmin, adminController.historialInventario);
router.get('/reporte_semanal', isLoggedIn, isAdmin, adminController.reporteSemanal);

module.exports = router;