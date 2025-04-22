const path = require('path');
const fs = require('fs');

// Guardar nuevo cargo
function saveCargo(req, res) {
  const data = req.body;

  const cargo = {
    nombre: data.nombre,
    salario: data.salario
  };

  req.getConnection((err, conn) => {
    conn.query('INSERT INTO CARGO SET ?', cargo, (err) => {
      if (err) {
        console.error('Error al guardar cargo:', err);
        return res.status(500).send('Error al guardar el cargo');
      }
      res.redirect('/admin/employees/add'); // Redirige al formulario de agregar empleado
    });
  });
}
// Listar empleados
// En la función listEmployees
function listEmployees(req, res) {
  req.getConnection((err, conn) => {
    // Consulta optimizada con JOIN
    conn.query(`
      SELECT 
        e.*,
        c.nombre AS cargo_nombre,
        c.salario
      FROM EMPLEADO e
      INNER JOIN CARGO c ON e.cod_cargo = c.cod_cargo
    `, (err, empleados) => {
      if (err) return res.status(500).send('Error al listar empleados');
      
      // Obtener cargos solo para formularios (si es necesario)
      conn.query('SELECT * FROM CARGO', (err, cargos) => {
        res.render('admin/employees/employees', {
          empleados, // Ahora cada empleado tiene cargo_nombre
          cargos,    // Para formularios de edición/agregar
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

// Guardar empleado
function saveEmployee(req, res) {
  const data = req.body;
  const file = req.file;

  const empleado = {
    nombres: data.nombres,
    apellidos: data.apellidos,
    ci: data.ci,
    celular: data.celular,
    direccion: data.direccion,
    fecha_contratacion: new Date(),
    email: data.email,
    foto: file ? file.filename : null,
    cod_cargo: data.cod_cargo
  };

  req.getConnection((err, conn) => {
    conn.query('INSERT INTO EMPLEADO SET ?', empleado, (err) => {
      if (err) {
        console.error('Error al guardar empleado:', err);
        return res.render('admin/employees/add', { error: 'Error al guardar el empleado' });
      }
      res.redirect('/admin/employees');
    });
  });
}

// Mostrar formulario de edición
function showEditForm(req, res) {
  const id = req.params.id;
  
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM EMPLEADO WHERE cod_empleado = ?', [id], (err, empleado) => {
      if (err || empleado.length === 0) return res.status(404).send('Empleado no encontrado');
      
      conn.query('SELECT * FROM CARGO', (err, cargos) => {
        if (err) return res.status(500).send('Error al obtener cargos');
        res.render('admin/employees/edit', {
          empleado: empleado[0],
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
    conn.query('SELECT foto FROM EMPLEADO WHERE cod_empleado = ?', [id], (err, rows) => {
      const oldFoto = rows[0]?.foto;

      const empleado = {
        nombres: data.nombres,
        apellidos: data.apellidos,
        ci: data.ci,
        celular: data.celular,
        direccion: data.direccion,
        email: data.email,
        cod_cargo: data.cod_cargo
      };

      if (file) {
        empleado.foto = file.filename;
        if (oldFoto) {
          const filePath = path.join(__dirname, '..', 'public', 'image', 'employees', oldFoto);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
    conn.query('SELECT foto FROM EMPLEADO WHERE cod_empleado = ?', [id], (err, rows) => {
      const foto = rows[0]?.foto;
      conn.query('DELETE FROM EMPLEADO WHERE cod_empleado = ?', [id], (err) => {
        if (foto) {
          const filePath = path.join(__dirname, '..', 'public', 'image', 'employees', foto);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
