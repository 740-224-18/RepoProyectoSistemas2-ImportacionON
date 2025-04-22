const express = require('express');
const router = express.Router();
const loginController = require('../controllers/authController');

router.get('/login', loginController.login);
router.post('/auth/login', loginController.auth);
router.get('/register', loginController.register);
router.post('/register', loginController.storeUser);
router.get('/register/client', (req, res) => {
    if (!req.session.loggedin) {
      return res.redirect('/login');
    }
    res.render('auth/registerClient', { active: { auth: true } });
});
router.post('/register/client', loginController.storeClient);
router.get('/logout', loginController.logout);
router.get('/home', loginController.home);
router.get('/admin/dashboard', loginController.admindashboard);


module.exports = router;
