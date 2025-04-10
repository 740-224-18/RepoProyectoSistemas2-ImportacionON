const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rutas para productos
router.get('/products', adminController.listProducts);          
router.get('/products/add', adminController.addProductForm);    
router.post('/products', adminController.addProduct);           
router.get('/products/edit/:id', adminController.editProductForm); 
router.post('/products/edit/:id', adminController.updateProduct); 
router.get('/products/delete/:id', adminController.deleteProduct); 

// Rutas para empleados
router.get('/employees', adminController.listEmployees);       
router.get('/employees/add', adminController.addEmployeeForm);  
router.post('/employees', adminController.addEmployee);         
router.get('/employees/edit/:id', adminController.editEmployeeForm); 
router.post('/employees/edit/:id', adminController.updateEmployee); 
router.get('/employees/delete/:id', adminController.deleteEmployee); 

module.exports = router;
