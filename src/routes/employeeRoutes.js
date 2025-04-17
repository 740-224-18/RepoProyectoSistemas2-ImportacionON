const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  listEmployees,
  showAddForm,
  saveEmployee,
  showEditForm,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

// Configuración de multer
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/image/employees'), // 🟢 NUEVA RUTA
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage });
  

// Rutas del CRUD de empleados
router.get('/', listEmployees);
router.get('/add', showAddForm);
router.post('/add', upload.single('foto'), saveEmployee);
router.get('/edit/:id', showEditForm);
router.post('/edit/:id', upload.single('foto'), updateEmployee);
router.get('/delete/:id', deleteEmployee);

const adminController = require('../controllers/adminController');

// Rutas para empleados
router.get('/employees', adminController.listEmployees);        // Ver empleados
router.get('/employees/add', adminController.addEmployeeForm);  // Formulario de agregar empleado
router.post('/employees', adminController.addEmployee);         // Agregar empleado
router.get('/employees/edit/:id', adminController.editEmployeeForm); // Formulario para editar empleado
router.post('/employees/edit/:id', adminController.updateEmployee); // Actualizar empleado
router.get('/employees/delete/:id', adminController.deleteEmployee); // Eliminar empleado


module.exports = router;
