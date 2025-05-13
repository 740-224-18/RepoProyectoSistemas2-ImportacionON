const path = require('path');
const fs = require('fs');

// Guardar nuevo cargo
function saveCargo(req, res) {
  const { nombre, salario, descripcion } = req.body; // Agregamos descripcion
  const cargo = { nombre, salario, descripcion }; // Incluimos descripción

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión a la base de datos');
    conn.query('INSERT INTO CARGO SET ?', cargo, (err) => {
      if (err) {
        console.error('Error al guardar cargo:', err);
        return res.status(500).send('Error al guardar el cargo');
      }
      res.redirect('/admin/employees/add');
    });
  });
}

// Listar empleados
function listEmployees(req, res) {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');

    const empleadosQuery = `
      SELECT 
        e.*,
        c.nombre AS cargo_nombre,
        c.salario
      FROM EMPLEADO e
      INNER JOIN CARGO c ON e.cod_cargo = c.cod_cargo
    `;

    conn.query(empleadosQuery, (err, empleados) => {
      if (err) return res.status(500).send('Error al listar empleados');

      conn.query('SELECT * FROM CARGO', (err, cargos) => {
        if (err) return res.status(500).send('Error al obtener cargos');

        res.render('admin/employees/employees', {
          empleados,
          cargos,
          active: { empleados: true },
          nombre: req.session.nombre
        });
      });
    });
  });
}

// Mostrar formulario de agregar
function showAddForm(req, res) {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');
    conn.query('SELECT * FROM CARGO', (err, cargos) => {
      if (err) return res.status(500).send('Error al obtener cargos');
      res.render('admin/employees/add', {
        cargos,
        active: { empleados: true },
        nombre: req.session.nombre
      });
    });
  });
}

// Guardar nuevo empleado
function saveEmployee(req, res) {
  const data = req.body;
  const file = req.file; // Asegúrate de que multer o similar esté configurado

  const empleado = {
    nombres: data.nombres,
    apellidos: data.apellidos,
    ci: data.ci,
    celular: data.celular,
    direccion: data.direccion,
    fecha_contratacion: new Date(),
    foto: file ? file.filename : null,
    cod_cargo: data.cod_cargo,
    genero_id: data.genero_id,
    email: data.email
  };

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');
    conn.query('INSERT INTO EMPLEADO SET ?', empleado, (err) => {
      if (err) {
        console.error('Error al guardar empleado:', err);
        return res.render('admin/employees/add', {
          error: 'Error al guardar el empleado',
          nombre: req.session.nombre,
          active: { empleados: true }
        });
      }
      res.redirect('/admin/employees');
    });
  });
}

// Mostrar formulario de edición
function showEditForm(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');

    conn.query('SELECT * FROM EMPLEADO WHERE cod_empleado = ?', [id], (err, result) => {
      if (err || result.length === 0) return res.status(404).send('Empleado no encontrado');

      const empleado = result[0];

      conn.query('SELECT * FROM CARGO', (err, cargos) => {
        if (err) return res.status(500).send('Error al obtener cargos');

        res.render('admin/employees/edit', {
          empleado,
          cargos,
          active: { empleados: true },
          nombre: req.session.nombre
        });
      });
    });
  });
}

// Actualizar empleado
function updateEmployee(req, res) {
  const id = req.params.id;
  const data = req.body;
  const file = req.file;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');

    // Obtener la foto actual para eliminar si se reemplaza
    conn.query('SELECT foto FROM EMPLEADO WHERE cod_empleado = ?', [id], (err, rows) => {
      if (err || rows.length === 0) return res.status(404).send('Empleado no encontrado');

      const oldFoto = rows[0].foto;

      const empleado = {
        nombres: data.nombres,
        apellidos: data.apellidos,
        ci: data.ci,
        celular: data.celular,
        direccion: data.direccion,
        email: data.email,
        cod_cargo: data.cod_cargo,
        genero_id: data.genero_id
      };

      if (file) {
        empleado.foto = file.filename;
        // Eliminar la foto antigua si existe
        if (oldFoto) {
          const filePath = path.join(__dirname, '..', 'public', 'image', 'employees', oldFoto);
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error al eliminar la imagen antigua:', err);
            });
          }
        }
      }

      conn.query('UPDATE EMPLEADO SET ? WHERE cod_empleado = ?', [empleado, id], (err) => {
        if (err) return res.status(500).send('Error al actualizar el empleado');
        res.redirect('/admin/employees');
      });
    });
  });
}

// Eliminar empleado
function deleteEmployee(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error de conexión');

    // Obtener foto para eliminarla luego
    conn.query('SELECT foto FROM EMPLEADO WHERE cod_empleado = ?', [id], (err, rows) => {
      if (err || rows.length === 0) return res.status(404).send('Empleado no encontrado');

      const foto = rows[0].foto;

      // Eliminar empleado
      conn.query('DELETE FROM EMPLEADO WHERE cod_empleado = ?', [id], (err) => {
        if (err) return res.status(500).send('Error al eliminar el empleado');

        // Eliminar archivo si existe
        if (foto) {
          const filePath = path.join(__dirname, '..', 'public', 'image', 'employees', foto);
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error al eliminar la imagen del empleado:', err);
            });
          }
        }

        res.redirect('/admin/employees');
      });
    });
  });
}

module.exports = {
  saveCargo,
  listEmployees,
  showAddForm,
  saveEmployee,
  showEditForm,
  updateEmployee,
  deleteEmployee
};