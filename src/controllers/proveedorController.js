const util = require('util');

// Listar proveedores
async function listProveedores(req, res) {
  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    const proveedores = await query(`
      SELECT p.*, e.nombre AS empresa_nombre
      FROM PROVEEDOR p
      LEFT JOIN EMPRESA e ON p.empresa_id = e.cod_empresa
    `);
    const empresas = await query('SELECT * FROM EMPRESA');
    const paises = await query('SELECT * FROM PAIS');

    res.render('admin/proveedores/proveedor', {
      proveedores,
      empresas,
      paises,
      active: { proveedores: true },
      nombre: req.session.nombre
    });
  } catch (err) {
    console.error('Error al listar proveedores:', err);
    res.status(500).send('Error al listar proveedores');
  }
}

// Mostrar formulario para agregar proveedor
async function showAddForm(req, res) {
  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    const empresas = await query('SELECT * FROM EMPRESA');
    const paises = await query('SELECT * FROM PAIS');
    res.render('admin/proveedores/add', {
      empresas,
      paises,
      active: { proveedores: true },
      nombre: req.session.nombre
    });
  } catch (err) {
    console.error('Error al mostrar formulario de proveedor:', err);
    res.status(500).send('Error al mostrar formulario de proveedor');
  }
}

// Guardar proveedor
async function saveProveedor(req, res) {
  const { nombre, email, telefono, direccion, empresa_id, representante } = req.body;
  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    await query('INSERT INTO PROVEEDOR SET ?', {
      nombre,
      email,
      telefono,
      direccion,
      empresa_id: empresa_id || null,
      representante
    });
    res.redirect('/admin/proveedores');
  } catch (err) {
    console.error('Error al guardar proveedor:', err);
    res.status(500).send('Error al guardar proveedor');
  }
}

// Mostrar formulario de edición
async function showEditForm(req, res) {
  const id = req.params.id;
  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    const proveedor = (await query('SELECT * FROM PROVEEDOR WHERE cod_proveedor = ?', [id]))[0];
    const empresas = await query('SELECT * FROM EMPRESA');
    const paises = await query('SELECT * FROM PAIS');
    if (!proveedor) return res.status(404).send('Proveedor no encontrado');
    res.render('admin/proveedores/edit', {
      proveedor,
      empresas,
      paises,
      active: { proveedores: true },
      nombre: req.session.nombre
    });
  } catch (err) {
    console.error('Error al mostrar formulario de edición:', err);
    res.status(500).send('Error al mostrar formulario de edición');
  }
}

// Actualizar proveedor
async function updateProveedor(req, res) {
  const id = req.params.id;
  const { nombre, email, telefono, direccion, empresa_id, representante } = req.body;
  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    await query('UPDATE PROVEEDOR SET ? WHERE cod_proveedor = ?', [{
      nombre,
      email,
      telefono,
      direccion,
      empresa_id: empresa_id || null,
      representante
    }, id]);
    res.redirect('/admin/proveedores');
  } catch (err) {
    console.error('Error al actualizar proveedor:', err);
    res.status(500).send('Error al actualizar proveedor');
  }
}

// Eliminar proveedor
async function deleteProveedor(req, res) {
  const id = req.params.id;
  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    await query('DELETE FROM PROVEEDOR WHERE cod_proveedor = ?', [id]);
    res.redirect('/admin/proveedores');
  } catch (err) {
    console.error('Error al eliminar proveedor:', err);
    res.status(500).send('Error al eliminar proveedor');
  }
}

// Guardar empresa (para el modal)
async function saveEmpresa(req, res) {
  const { nombre, nit, telefono, direccion, email, pais_id } = req.body;
  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    const result = await query('INSERT INTO EMPRESA SET ?', {
      nombre,
      nit,
      telefono,
      direccion,
      email,
      pais_id
    });
    res.json({ id: result.insertId, nombre });
  } catch (err) {
    console.error('Error al guardar empresa:', err);
    res.status(500).json({ error: 'Error al guardar empresa' });
  }
}

module.exports = {
  listProveedores,
  showAddForm,
  saveProveedor,
  showEditForm,
  updateProveedor,
  deleteProveedor,
  saveEmpresa
};