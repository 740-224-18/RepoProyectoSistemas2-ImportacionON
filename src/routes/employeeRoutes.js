const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  saveCargo,
  listEmployees,
  showAddForm,
  saveEmployee,
  showEditForm,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

// Configuración de multer para imágenes de empleados
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/image/employees'), // Ruta para las fotos de empleados
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
  }
});
const upload = multer({ storage });

router.post('/add-cargo', saveCargo);
router.get('/', listEmployees);
router.get('/add', showAddForm);
router.post('/add', upload.single('foto'), saveEmployee);
router.get('/edit/:id', showEditForm);
router.post('/edit/:id', upload.single('foto'), updateEmployee);
router.get('/delete/:id', deleteEmployee);

module.exports = router;
