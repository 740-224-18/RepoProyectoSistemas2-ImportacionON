const bcrypt = require('bcrypt');

// Mostrar login
function login(req, res) {
  if (!req.session.loggedin) {
    res.render('auth/login');
  } else {
    res.redirect('/');
  }
}

// Procesar autenticación
function auth(req, res) {
  const data = req.body;
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM REGISTRO WHERE email = ?', [data.email], (err, usuarios) => {
      if (err) {
        console.error('Error en consulta:', err);
        return res.status(500).render('auth/login', { error: 'Error del servidor' });
      }

      if (usuarios.length === 0) {
        return res.render('auth/login', { error: 'Usuario no registrado' });
      }

      const usuario = usuarios[0];

      bcrypt.compare(data.password, usuario.password, (err, match) => {
        if (!match) {
          return res.render('auth/login', { error: 'Contraseña incorrecta' });
        }

        req.session.loggedin = true;
        req.session.nombre = usuario.usuario;
        req.session.role = usuario.rol;
        req.session.cod_registro = usuario.cod_registro;

        if (usuario.rol === 1) {
          res.redirect('/admin/dashboard');
        } else {
          res.redirect('/home');
        }
      });
    });
  });
}

// Mostrar registro
function register(req, res) {
  if (!req.session.loggedin) {
    res.render('auth/register');
  } else {
    res.redirect('/');
  }
}

// Guardar nuevo usuario
function storeUser(req, res) {
  const data = req.body;
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM REGISTRO WHERE email = ?', [data.email], (err, existing) => {
      if (existing.length > 0) {
        return res.render('auth/register', { error: 'El correo ya está registrado' });
      }

      bcrypt.hash(data.password, 12).then(hash => {
        const registro = {
          usuario: data.usuario,
          email: data.email,
          password: hash,
          rol: data.rol || 0,
          cliente_id: null
        };

        conn.query('INSERT INTO REGISTRO SET ?', registro, (err) => {
          if (err) {
            console.error('Error al guardar usuario:', err);
            return res.render('auth/register', { error: 'Error al registrar usuario' });
          }

          req.session.loggedin = true;
          req.session.nombre = registro.usuario;
          req.session.role = registro.rol;

          if (registro.rol === 1) {
            res.redirect('/admin/dashboard');
          } else {
            res.redirect('/home');
          }
        });
      }).catch(err => {
        console.error('Error al hashear:', err);
        res.render('auth/register', { error: 'Error en la contraseña' });
      });
    });
  });
}

function storeClient(req, res) {
  const { nombres, apellidos, ci_o_nit, email, celular, direccion } = req.body;

  // Validamos que los campos no estén vacíos
  if (!nombres || !apellidos || !ci_o_nit || !email || !celular || !direccion) {
    return res.render('auth/registerClient', { error: 'Por favor complete todos los campos.' });
  }

  req.getConnection((err, conn) => {
    const newClient = {
      nombres,
      apellidos,
      ci_o_nit,
      email,
      celular,
      direccion
    };

    // Insertamos el cliente en la tabla CLIENTE
    conn.query('INSERT INTO CLIENTE SET ?', newClient, (err, result) => {
      if (err) return res.status(500).send('Error al registrar el cliente.');

      const clientId = result.insertId; // Obtenemos el ID del cliente registrado

      // Actualizamos la tabla REGISTRO con el cliente_id
      conn.query('UPDATE REGISTRO SET cliente_id = ? WHERE email = ?', [clientId, email], (err) => {
        if (err) return res.status(500).send('Error al vincular cliente con el usuario.');
        
        res.redirect('/home');  // Redirigimos al home después de registrar al cliente
      });
    });
  });
}

// Cerrar sesión
function logout(req, res) {
  req.session.destroy();
  res.redirect('/login');
}

// Dashboard de admin
function admindashboard(req, res) {
  if (req.session.loggedin && req.session.role === 1) {
    res.render('admin/dashboard', { nombre: req.session.nombre, active: { dashboard: true } });
  } else {
    res.redirect('/login');
  }
}

// Home de cliente
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
  auth,
  register,
  storeUser,
  storeClient,
  logout,
  admindashboard,
  home
};
