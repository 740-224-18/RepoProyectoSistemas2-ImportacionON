const express = require('express');
const router = express.Router();
const contactosController = require('../controllers/contactosController');

// Mostrar formulario de contacto y mensaje de éxito
router.get('/contactos', (req, res) => {
  res.render('pages/contactos', { enviado: req.query.enviado });
});

// Guardar contacto
router.post('/enviar-contacto', contactosController.guardarContacto);

module.exports = router;