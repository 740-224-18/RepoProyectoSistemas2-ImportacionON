const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const { isLoggedIn, isAdmin } = require('../middlewares/authMiddleware');

// Listar proveedores
router.get('/proveedores', isLoggedIn, isAdmin, proveedorController.listProveedores);

// Formulario agregar proveedor
router.get('/proveedores/add', isLoggedIn, isAdmin, proveedorController.showAddForm);
router.post('/proveedores/add', isLoggedIn, isAdmin, proveedorController.saveProveedor);

// Formulario editar proveedor
router.get('/proveedores/edit/:id', isLoggedIn, isAdmin, proveedorController.showEditForm);
router.post('/proveedores/edit/:id', isLoggedIn, isAdmin, proveedorController.updateProveedor);

// Eliminar proveedor
router.post('/proveedores/delete/:id', isLoggedIn, isAdmin, proveedorController.deleteProveedor);

// Agregar empresa (modal)
router.post('/empresas/add', isLoggedIn, isAdmin, proveedorController.saveEmpresa);

module.exports = router;