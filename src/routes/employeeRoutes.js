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

  

// Rutas del CRUD de empleados
router.get('/', listEmployees);
router.get('/add', showAddForm);
router.post('/add', upload.single('foto'), saveEmployee);
router.get('/edit/:id', showEditForm);
router.post('/edit/:id', upload.single('foto'), updateEmployee);
router.get('/delete/:id', deleteEmployee);

module.exports = router;
