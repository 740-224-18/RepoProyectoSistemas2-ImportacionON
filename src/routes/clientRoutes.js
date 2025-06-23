const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Mostrar formulario de registro de cliente
router.get('/register/client', clientController.showRegisterClient);

// Guardar datos de cliente y dirección
router.post('/register/client', clientController.storeClient);

router.get('/recibo/:id', clientController.verRecibo);


module.exports = router;