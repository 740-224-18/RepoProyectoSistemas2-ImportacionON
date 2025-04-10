const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rutas para productos
router.get('/products', adminController.listProducts);          // Ver productos
router.get('/products/add', adminController.addProductForm);    // Formulario de agregar producto
router.post('/products', adminController.addProduct);           // Agregar producto
router.get('/products/edit/:id', adminController.editProductForm); // Formulario para editar producto
router.post('/products/edit/:id', adminController.updateProduct); // Actualizar producto
router.get('/products/delete/:id', adminController.deleteProduct); // Eliminar producto

module.exports = router;
