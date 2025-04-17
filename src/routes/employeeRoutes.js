const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rutas para empleados
router.get('/employees', adminController.listEmployees);        // Ver empleados
router.get('/employees/add', adminController.addEmployeeForm);  // Formulario de agregar empleado
router.post('/employees', adminController.addEmployee);         // Agregar empleado
router.get('/employees/edit/:id', adminController.editEmployeeForm); // Formulario para editar empleado
router.post('/employees/edit/:id', adminController.updateEmployee); // Actualizar empleado
router.get('/employees/delete/:id', adminController.deleteEmployee); // Eliminar empleado

module.exports = router;
