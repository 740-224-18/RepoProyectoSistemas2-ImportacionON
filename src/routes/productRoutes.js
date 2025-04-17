const express = require('express');
const router = express.Router();

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


// Rutas para productos
router.get('/products', adminController.listProducts);          // Ver productos
router.get('/products/add', adminController.addProductForm);    // Formulario de agregar producto
router.post('/products', adminController.addProduct);           // Agregar producto
router.get('/products/edit/:id', adminController.editProductForm); // Formulario para editar producto
router.post('/products/edit/:id', adminController.updateProduct); // Actualizar producto
router.get('/products/delete/:id', adminController.deleteProduct); // Eliminar producto


module.exports = router;
