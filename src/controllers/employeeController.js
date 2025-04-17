const path = require('path');
const fs = require('fs');

// Listar empleados
function listEmployees(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM empleados', (err, empleados) => {
      if (err) return res.status(500).send('Error al listar empleados');

      res.render('admin/employees/employees', {
        empleados,
        active: { empleados: true },
        nombre: req.session.nombre
      });
    });
  });
}

// Mostrar formulario para agregar empleado
function showAddForm(req, res) {
  res.render('admin/employees/add', {
    active: { empleados: true },
    nombre: req.session.nombre
  });
}

// Guardar nuevo empleado
function saveEmployee(req, res) {
  const data = req.body;
  const file = req.file;

  const empleado = {
    nombre: data.nombre,
    apellido: data.apellido,
    correo: data.correo,
    telefono: data.telefono,
    rol: data.rol,
    foto: file ? file.filename : null
  };

  req.getConnection((err, conn) => {
    conn.query('INSERT INTO empleados SET ?', empleado, (err) => {
        if (err) {
            console.error('ERROR MYSQL AL GUARDAR:', err); // <-- importante
            return res.status(500).send('Error al guardar empleado');
        }        
      res.redirect('/admin/employees');
    });
  });
}

// Mostrar formulario para editar empleado
function showEditForm(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM empleados WHERE id = ?', [id], (err, rows) => {
      if (err || rows.length === 0) return res.status(404).send('Empleado no encontrado');

      res.render('admin/employees/edit', {
        empleado: rows[0],
        active: { empleados: true },
        nombre: req.session.nombre
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
    conn.query('SELECT foto FROM empleados WHERE id = ?', [id], (err, rows) => {
      const oldFoto = rows[0]?.foto;

      const empleado = {
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        telefono: data.telefono,
        rol: data.rol
      };

      if (file) {
        empleado.foto = file.filename;
      
        // Eliminar imagen anterior si existe
        if (oldFoto) {
          const filePath = path.join(__dirname, '..', 'public', 'image', 'employees', oldFoto);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }
      

      conn.query('UPDATE empleados SET ? WHERE id = ?', [empleado, id], (err) => {
        if (err) return res.status(500).send('Error al actualizar empleado');
        res.redirect('/admin/employees');
      });
    });
  });
}

// Eliminar empleado
function deleteEmployee(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    conn.query('SELECT foto FROM empleados WHERE id = ?', [id], (err, rows) => {
      const foto = rows[0]?.foto;

      conn.query('DELETE FROM empleados WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send('Error al eliminar');

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
  listEmployees,
  showAddForm,
  saveEmployee,
  showEditForm,
  updateEmployee,
  deleteEmployee
};
