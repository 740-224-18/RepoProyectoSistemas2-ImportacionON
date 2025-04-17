const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const multer = require('multer');
const path = require('path');
const {
  listProducts,
  showAddForm,
  saveProduct,
  showEditForm,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/image/products'), // 🟢 NUEVA RUTA
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage });
  
router.get('/', listProducts);
router.get('/add', showAddForm);
router.post('/add', upload.single('imagen'), saveProduct);
router.get('/edit/:id', showEditForm);
router.post('/edit/:id', upload.single('imagen'), updateProduct);
router.get('/delete/:id', deleteProduct);
=======
const adminController = require('../controllers/adminController');

// Rutas para productos
router.get('/products', adminController.listProducts);          // Ver productos
router.get('/products/add', adminController.addProductForm);    // Formulario de agregar producto
router.post('/products', adminController.addProduct);           // Agregar producto
router.get('/products/edit/:id', adminController.editProductForm); // Formulario para editar producto
router.post('/products/edit/:id', adminController.updateProduct); // Actualizar producto
router.get('/products/delete/:id', adminController.deleteProduct); // Eliminar producto
>>>>>>> 3de343236cd97367c1a8f3700a9bbf5057c3a113

module.exports = router;
