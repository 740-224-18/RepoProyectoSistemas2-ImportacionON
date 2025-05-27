const util = require('util');

// Ver perfil del cliente
async function perfilCliente(req, res) {
  if (!req.session.loggedin || !req.session.cliente_id) {
    return res.redirect('/login');
  }

  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    const cliente = await query(`
      SELECT C.*, G.nombre AS genero
      FROM CLIENTE C
      LEFT JOIN GENERO G ON C.genero_id = G.cod_genero
      WHERE C.cod_cliente = ?
    `, [req.session.cliente_id]);

    res.render('cliente/perfil', {
      cliente: cliente[0],
      nombre: req.session.nombre,
      rol: req.session.rolNombre,
      active: { perfil: true }
    });
  } catch (err) {
    console.error('Error al cargar perfil del cliente:', err);
    res.status(500).render('error', { error: 'Error al cargar perfil del cliente' });
  }
}

// Mostrar formulario para editar datos
async function editarPerfil(req, res) {
  if (!req.session.loggedin || !req.session.cliente_id) {
    return res.redirect('/login');
  }

  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    const cliente = await query('SELECT * FROM CLIENTE WHERE cod_cliente = ?', [req.session.cliente_id]);
    const generos = await query('SELECT * FROM GENERO');

    res.render('cliente/editar', {
      cliente: cliente[0],
      generos,
      nombre: req.session.nombre,
      rol: req.session.rolNombre,
      active: { perfil: true }
    });
  } catch (err) {
    console.error('Error al cargar formulario de edición:', err);
    res.status(500).render('error', { error: 'Error al cargar formulario de edición' });
  }
}

// Procesar edición de perfil
async function actualizarPerfil(req, res) {
  if (!req.session.loggedin || !req.session.cliente_id) {
    return res.redirect('/login');
  }

  const { nombres, apellidos, celular, ci_o_nit, fecha_nacimiento, genero_id } = req.body;

  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    await query(`
      UPDATE CLIENTE SET 
        nombres = ?, apellidos = ?, celular = ?, ci_o_nit = ?, 
        fecha_nacimiento = ?, genero_id = ?
      WHERE cod_cliente = ?
    `, [nombres, apellidos, celular, ci_o_nit, fecha_nacimiento, genero_id, req.session.cliente_id]);

    res.redirect('/cliente/perfil');
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).render('error', { error: 'Error al actualizar perfil' });
  }
}

// Mostrar direcciones del cliente
async function verDirecciones(req, res) {
  if (!req.session.loggedin || !req.session.cliente_id) {
    return res.redirect('/login');
  }

  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    const direcciones = await query(`
      SELECT DC.*, D.nombre AS departamento, P.nombre AS pais
      FROM DIRECCION_CLIENTE DC
      LEFT JOIN DEPARTAMENTO D ON DC.departamento_id = D.cod_departamento
      LEFT JOIN PAIS P ON DC.pais_id = P.cod_pais
      WHERE cliente_id = ?
    `, [req.session.cliente_id]);

    res.render('cliente/direcciones', {
      direcciones,
      nombre: req.session.nombre,
      rol: req.session.rolNombre,
      active: { direcciones: true }
    });
  } catch (err) {
    console.error('Error al obtener direcciones:', err);
    res.status(500).render('error', { error: 'Error al cargar direcciones' });
  }
}

// Agregar dirección
async function agregarDireccion(req, res) {
  const { direccion, ciudad, departamento_id, pais_id, codigo_postal, referencia } = req.body;

  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    await query(`
      INSERT INTO DIRECCION_CLIENTE 
        (cliente_id, direccion, ciudad, departamento_id, pais_id, codigo_postal, referencia)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [req.session.cliente_id, direccion, ciudad, departamento_id, pais_id, codigo_postal, referencia]);

    res.redirect('/cliente/direcciones');
  } catch (err) {
    console.error('Error al agregar dirección:', err);
    res.status(500).render('error', { error: 'No se pudo guardar la dirección' });
  }
}

module.exports = {
  perfilCliente,
  editarPerfil,
  actualizarPerfil,
  verDirecciones,
  agregarDireccion
};
