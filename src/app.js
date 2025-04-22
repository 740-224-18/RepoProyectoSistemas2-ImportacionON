const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes'); 
const employeeRoutes = require('./routes/employeeRoutes');
const productRoutes = require('./routes/productRoutes');
const clientProductRoutes = require('./routes/clientProductRoutes'); 
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
    database: 'importadoraon'
}, 'single'));

// Archivos estáticos para fotos subidas
app.use('/images/employees', express.static(path.join(__dirname, 'public/image/employees')));
app.use('/images/products', express.static(path.join(__dirname, 'public/image/products')));

// Archivos estáticos generales (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Motor de vistas con Handlebars
app.engine('.hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        // Helper para igualdad estricta (===)
        eq: (a, b) => a === b,
        
        // Helper para desigualdad (!==)
        neq: (a, b) => a !== b,
      
        // Otros helpers existentes (toUpperCase, repeat, etc.)
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

// Rutas
app.use('/', authRoutes);
app.use('/admin/employees', employeeRoutes);
app.use('/admin/products', productRoutes);
app.use('/productos', clientProductRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    if (req.session.loggedin === true) {
        res.redirect(req.session.role === 1 ? '/admin/dashboard' : '/home');
    } else {
        res.redirect('/login');
    }
});
app.get('/productos', (req, res) => {
    res.render('pages/productos');  // Renderiza la vista "pages/productos.hbs"
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

// Iniciar servidor
app.listen(app.get('port'), () => {
    console.log('Escuchando en el puerto', app.get('port'));
});
