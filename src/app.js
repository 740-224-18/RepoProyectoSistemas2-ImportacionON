const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const loginRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');

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

// Rutas
app.use('/', loginRoutes); // Donde loginRoutes es un objeto en lugar de un router

// Ruta raíz simplificada
app.get('/', (req, res) => {
    if(req.session.loggedin == true) {
        res.redirect(req.session.user?.role === 1 ? '/admin/dashboard' : '/home');
    } else {
        res.redirect('/login');
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
        message: 'Algo salio mal en el servidor'
    });
});

app.use('/admin', adminRoutes);

app.engine('.hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        eq: function (a, b) { return a === b; },
        lt: function (a, b) { return a < b; },
        gt: function (a, b) { return a > b; },
        toUpperCase: (str) => str ? str.toUpperCase() : '',
        formatDate: (date) => date ? new Date(date).toLocaleDateString() : ''
    }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views')); 

// Usar rutas
app.use('/', authRoutes);
app.use('/', productRoutes); 

app.listen(app.get('port'), () => {
    console.log('Escuchando el puerto: ', app.get('port'));
});
