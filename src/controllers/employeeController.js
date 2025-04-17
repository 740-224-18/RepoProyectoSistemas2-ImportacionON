const path = require('path');
const fs = require('fs');

function listProducts(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM productos', (err, productos) => {
      if (err) return res.status(500).send('Error al listar productos');
      res.render('admin/products/products', {
        productos,
        active: { productos: true },
        nombre: req.session.nombre
      });
    });
  });
}

function showAddForm(req, res) {
  res.render('admin/products/add', {
    active: { productos: true },
    nombre: req.session.nombre
  });
}

function saveProduct(req, res) {
  const data = req.body;
  const file = req.file;

  const producto = {
    nombre: data.nombre,
    descripcion: data.descripcion,
    precio: data.precio,
    stock: data.stock,
    categoria: data.categoria,
    imagen: file ? file.filename : null
  };

  req.getConnection((err, conn) => {
    conn.query('INSERT INTO productos SET ?', producto, (err) => {
      if (err) {
        console.error('ERROR MYSQL AL GUARDAR PRODUCTO:', err);
        return res.render('admin/products/add', {
          error: 'Ocurrió un error al guardar el producto.',
          formData: producto,
          active: { productos: true },
          nombre: req.session.nombre
        });
      }
      res.redirect('/admin/products');
    });
  });
}

function showEditForm(req, res) {
  const id = req.params.id;
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM productos WHERE id = ?', [id], (err, rows) => {
      if (err || rows.length === 0) return res.status(404).send('Producto no encontrado');
      res.render('admin/products/edit', {
        producto: rows[0],
        active: { productos: true },
        nombre: req.session.nombre
      });
    });
  });
}

function updateProduct(req, res) {
  const id = req.params.id;
  const data = req.body;
  const file = req.file;

  req.getConnection((err, conn) => {
    conn.query('SELECT imagen FROM productos WHERE id = ?', [id], (err, rows) => {
      const oldImage = rows[0]?.imagen;

      const producto = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        stock: data.stock,
        categoria: data.categoria
      };

      if (file) {
        producto.imagen = file.filename;
      
        if (oldImage) {
          const filePath = path.join(__dirname, '..', 'public', 'image', 'products', oldImage);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }
      

      conn.query('UPDATE productos SET ? WHERE id = ?', [producto, id], (err) => {
        if (err) return res.status(500).send('Error al actualizar producto');
        res.redirect('/admin/products');
      });
    });
  });
}

function deleteProduct(req, res) {
  const id = req.params.id;
  req.getConnection((err, conn) => {
    conn.query('SELECT imagen FROM productos WHERE id = ?', [id], (err, rows) => {
      const imagen = rows[0]?.imagen;
      conn.query('DELETE FROM productos WHERE id = ?', [id], (err) => {
        if (imagen) {
            const filePath = path.join(__dirname, '..', 'public', 'image', 'products', imagen);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }
          
        res.redirect('/admin/products');
      });
    });
  });
}

module.exports = {
  listProducts,
  showAddForm,
  saveProduct,
  showEditForm,
  updateProduct,
  deleteProduct
};
