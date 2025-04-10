const bcrypt = require('bcrypt');

function login(req, res) {
    if (req.session.loggedin != true) {
        res.render('auth/login');
    } else {
        res.redirect('/');
    }
}

function auth(req, res) {
    const data = req.body;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM usuarios WHERE email = ?', [data.email], (err, userdata) => {
            if (userdata.length > 0) {
                bcrypt.compare(data.password, userdata[0].password, (err, isMatch) => {
                    if (!isMatch) {
                        res.render('auth/login', { error: 'Contraseña incorrecta' });
                    } else {
                        req.session.loggedin = true;
                        req.session.nombre = userdata[0].nombre;
                        req.session.role = userdata[0].role;

                        if (userdata[0].role === 1) {
                            res.redirect('/admin/dashboard');
                        } else {
                            res.redirect('/home');
                        }
                    }
                });
            } else {
                res.render('auth/login', { error: 'Usuario no existe' });
            }
        });
    });
}

function register(req, res) {
    if (req.session.loggedin != true) {
        res.render('auth/register');
    } else {
        res.redirect('/');
    }
}

function storeUser(req, res) {
    const data = req.body;

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM usuarios WHERE email = ?', [data.email], (err, userdata) => {
            if (userdata.length > 0) {
                res.render('auth/register', { error: 'El usuario ya existe, cambie otro porfavor' });
            } else {
                bcrypt.hash(data.password, 12).then(hash => {
                    // Crear objeto solo con los campos que necesita la tabla
                    const userToInsert = {
                        nombre: data.nombre,
                        apellido: data.apellido,
                        celular: data.celular,
                        email: data.email,
                        password: hash,
                        role: data.role || 0
                    };

                    conn.query('INSERT INTO usuarios SET ?', userToInsert, (err, rows) => {
                        if (err) {
                            console.error('Error en la consulta:', err);
                            return res.status(500).render('auth/register', { 
                                error: 'Error al registrar usuario' 
                            });
                        }

                        req.session.loggedin = true;
                        req.session.nombre = userToInsert.nombre;
                        req.session.role = userToInsert.role;

                        if (userToInsert.role === 1) {
                            res.redirect('/admin/dashboard');
                        } else {
                            res.redirect('/home');
                        }
                    });
                }).catch(err => {
                    console.error('Error al hashear:', err);
                    res.status(500).render('auth/register', { 
                        error: 'Error al procesar la contraseña' 
                    });
                });
            }
        });
    });
}

function logout(req, res) {
    if (req.session.loggedin == true) {
        req.session.destroy();
    }
    res.redirect('/login');
}

function admindashboard(req, res) {
    if (req.session.loggedin && req.session.role === 1) {
        res.render('admin/dashboard', { nombre: req.session.nombre });
    } else {
        res.redirect('/login');
    }
}

function home(req, res) {
    if (req.session.loggedin) {
        res.render('home', { 
            nombre: req.session.nombre,
            layout: 'main' 
        });
    } else {
        res.redirect('/login');
    }
}

module.exports = {
    login,
    register,
    storeUser,
    auth,
    logout,
    admindashboard,
    home
};