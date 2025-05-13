const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Importación de controladores
const {
  saveCargo,
  listEmployees,
  showAddForm,
  saveEmployee,
  showEditForm,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

// Configuración de multer para el manejo de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/image/employees'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 } // Límite de 2MB
});

// Rutas
router.post('/add-cargo', saveCargo); 
router.get('/', listEmployees); 
router.get('/add', showAddForm); 
router.post('/add', upload.single('foto'), saveEmployee); 
router.get('/edit/:id', showEditForm); 
router.post('/edit/:id', upload.single('foto'), updateEmployee); 
router.get('/delete/:id', deleteEmployee); 

module.exports = router;
