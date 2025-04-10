const express = require('express');
const router = express.Router();
const loginController = require('../controllers/authController');

router.get('/login', loginController.login);
router.post('/auth/login', loginController.auth);
router.get('/register', loginController.register);
router.post('/register', loginController.storeUser);
router.get('/logout', loginController.logout);
router.get('/home', loginController.home);
router.get('/admin/dashboard', loginController.admindashboard);

router.get('/admin/employees', (req, res) => {
    if (req.session.role === 1) {
        res.render('admin/employees', { layout: 'admin' });
    }
});
router.get('/admin/products/list', (req, res) => {
    if (req.session.role === 1) {
        res.render('admin/products/list', { layout: 'admin' });
    }
});
router.get('/admin/products/form', (req, res) => {
    if (req.session.role === 1) {
        res.render('admin/products/form', { layout: 'admin' });
    }
});

module.exports = router;
