const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');  // Solo authRoutes
const adminRoutes = require('./routes/adminRoutes'); // Admin routes que contienen productos y empleados

const path = require('path');

const app = express();
app.set('port', 4000);

// Middlewares
app.use(bodyParser.urlencoded({ extended: true })); // Para formularios
app.use(bodyParser.json()); // Para AJAX

// Configuración de sesión corregida
app.use(session({
    secret: 'tuClaveSecretaSegura123', // Cambia por una clave más segura
    resave: false, // Cambiado a false para mejor performance
    saveUninitialized: false, // Cambiado a false por seguridad
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000 // 1 día de duración
    }
}));

// Conexión a MySQL
app.use(myconnection(mysql, {
    host: '127.0.0.1',
    user: 'root',
    password: '12345678',
    port: 3306,
    database: 'importadora'
}, 'single', (err) => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
    } else {
        console.log('Conexión a la base de datos establecida');
    }
}));

// Rutas de autenticación
app.use('/', authRoutes); // Redirige las rutas de login, registro y logout

// Ruta raíz simplificada
app.get('/', (req, res) => {
    if(req.session.loggedin == true) {
        res.redirect(req.session.user?.role === 1 ? '/admin/dashboard' : '/home');  // Si es admin redirige al dashboard
    } else {
        res.redirect('/login');  // Si no está logueado, redirige al login
    }
});

// Manejo de errores
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Página no encontrada',
        message: 'La pagina que buscas no existe'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error del servidor',
        message: 'Algo salió mal en el servidor'
    });
});

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
});
