const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
<<<<<<< HEAD
const authRoutes = require('./routes/authRoutes'); 
const employeeRoutes = require('./routes/employeeRoutes');
const productRoutes = require('./routes/productRoutes');
=======
const authRoutes = require('./routes/authRoutes');  // Solo authRoutes
const adminRoutes = require('./routes/adminRoutes'); // Admin routes que contienen productos y empleados
>>>>>>> 3de343236cd97367c1a8f3700a9bbf5057c3a113

const path = require('path');

const app = express();
app.set('port', 4000);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de sesión
app.use(session({
    secret: 'tuClaveSecretaSegura123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Conexión a MySQL
app.use(myconnection(mysql, {
    host: '127.0.0.1',
    user: 'root',
    password: '12345678',
    port: 3306,
    database: 'importadora'
}, 'single'));

// Archivos estáticos para fotos subidas
app.use('/images/employees', express.static(path.join(__dirname, 'public/image/employees')));
app.use('/images/products', express.static(path.join(__dirname, 'public/image/products')));


// Motor de vistas
app.engine('.hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        toUpperCase: (str) => str ? str.toUpperCase() : '',
        repeat: (n, block) => {
            let accum = '';
            for (let i = 0; i < n; ++i)
                accum += block.fn(i);
            return accum;
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

<<<<<<< HEAD
// Rutas
app.use('/', authRoutes);
app.use('/admin/employees', employeeRoutes);
app.use('/admin/products', productRoutes);
=======
// Rutas de autenticación
app.use('/', authRoutes); // Redirige las rutas de login, registro y logout
>>>>>>> 3de343236cd97367c1a8f3700a9bbf5057c3a113

// Ruta raíz
app.get('/', (req, res) => {
<<<<<<< HEAD
    if (req.session.loggedin === true) {
        res.redirect(req.session.role === 1 ? '/admin/dashboard' : '/home');
=======
    if(req.session.loggedin == true) {
        res.redirect(req.session.user?.role === 1 ? '/admin/dashboard' : '/home');  // Si es admin redirige al dashboard
>>>>>>> 3de343236cd97367c1a8f3700a9bbf5057c3a113
    } else {
        res.redirect('/login');  // Si no está logueado, redirige al login
    }
});

// Manejo de errores
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Página no encontrada',
        message: 'La página que buscas no existe'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error del servidor',
        message: 'Algo salió mal en el servidor'
    });
});

<<<<<<< HEAD
// Iniciar servidor
app.listen(app.get('port'), () => {
    console.log('Escuchando en el puerto', app.get('port'));
=======
// Rutas del panel administrativo (productos y empleados)
app.use('/admin', adminRoutes);  // Admin routes (CRUD de productos y empleados)

// Configuración de Handlebars
app.engine('.hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',  // Layout principal
    layoutsDir: path.join(__dirname, 'views/layouts'),  // Ubicación de los layouts
    partialsDir: path.join(__dirname, 'views/partials'), // Ubicación de los partials
    helpers: {
        eq: function (a, b) { return a === b; },
        lt: function (a, b) { return a < b; },
        gt: function (a, b) { return a > b; },
        toUpperCase: (str) => str ? str.toUpperCase() : '',  // Helper para mayúsculas
        formatDate: (date) => date ? new Date(date).toLocaleDateString() : ''  // Helper para formatear fechas
    }
}));

app.set('view engine', 'hbs');  // Establecer Handlebars como motor de plantillas
app.set('views', path.join(__dirname, 'views'));  // Definir el directorio de vistas

// Iniciar servidor
app.listen(app.get('port'), () => {
    console.log('Servidor en puerto:', app.get('port'));  // Log cuando el servidor está corriendo
>>>>>>> 3de343236cd97367c1a8f3700a9bbf5057c3a113
});
