const path = require('path');
const fs = require('fs');

function saveCategory(req, res) {
  const data = req.body;

  const categoria = {
    nombre: data.nombre,
    descripcion: data.descripcion
  };

  req.getConnection((err, conn) => {
    conn.query('INSERT INTO CATEGORIA SET ?', categoria, (err) => {
      if (err) {
        console.error('Error al guardar la categoría:', err);
        return res.status(500).send('Error al guardar la categoría');
      }
      res.redirect('/admin/products/add'); // Redirige al formulario de agregar producto
    });
  });
}
// Listar productos
function listProducts(req, res) {
  req.getConnection((err, conn) => {
    // Consulta optimizada con JOIN para evitar el doble query
    // En productController.js (función listProducts)
conn.query(`
  SELECT 
    p.*,
    c.nombre AS categoria_nombre
  FROM PRODUCTO p
  INNER JOIN CATEGORIA c ON p.cod_cat = c.cod_cat
`, (err, productos) => {
  // Renderiza directamente sin necesidad del bucle de categorías
  res.render('admin/products/products', {
    productos, // Ahora cada producto tiene 'categoria_nombre'
    active: { productos: true },
    nombre: req.session.nombre
  });
  });
    });
}

// Mostrar formulario para agregar producto
function showAddForm(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM CATEGORIA', (err, categorias) => {
      if (err) return res.status(500).send('Error al obtener categorías');
      res.render('admin/products/add', {
        categorias,
        active: { productos: true },
        nombre: req.session.nombre
      });
    });
  });
}

// Guardar nuevo producto
function saveProduct(req, res) {
  const data = req.body;
  const file = req.file;

  const producto = {
    nombre: data.nombre,
    descripcion: data.descripcion,
    precio: data.precio,
    stock: data.stock,
    foto: file ? file.filename : null,
    cod_cat: data.cod_cat
  };

  req.getConnection((err, conn) => {
    conn.query('INSERT INTO PRODUCTO SET ?', producto, (err) => {
      if (isNaN(data.precio) || data.precio <= 0) {
        return res.status(400).send("Precio inválido");
      }
      if (err) {
        console.error('Error al guardar producto:', err);
        return res.render('admin/products/add', { error: 'Error al guardar el producto' });
      }
      res.redirect('/admin/products');
    });
  });
}

// Mostrar formulario de edición para producto
function showEditForm(req, res) {
  const id = req.params.id;
  
  req.getConnection((err, conn) => {
    // Consultar el producto
    conn.query('SELECT * FROM PRODUCTO WHERE cod_producto = ?', [id], (err, producto) => {
      if (err || producto.length === 0) return res.status(404).send('Producto no encontrado');
      
      // Consultar las categorías
      conn.query('SELECT * FROM CATEGORIA', (err, categorias) => {
        if (err) return res.status(500).send('Error al obtener categorías');
        
        // Renderizar la vista de edición con los datos obtenidos
        res.render('admin/products/edit', {
          producto: producto[0], // Producto específico
          categorias,             // Lista de categorías
          active: { productos: true },
          nombre: req.session.nombre
        });
      });
    });
  });
}


// Actualizar producto
function updateProduct(req, res) {
  const id = req.params.id;
  const data = req.body;
  const file = req.file;

  req.getConnection((err, conn) => {
    // Obtener la foto actual del producto
    conn.query('SELECT foto FROM PRODUCTO WHERE cod_producto = ?', [id], (err, rows) => {
      if (err) return res.status(500).send('Error al obtener la foto del producto');

      const oldFoto = rows[0]?.foto; // Foto antigua, si existe

      // Construir el objeto con los datos a actualizar
      const producto = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        stock: data.stock,
        cod_cat: data.cod_cat
      };

      // Si se sube una nueva foto, actualizarla y eliminar la anterior si existe
      if (file) {
        producto.foto = file.filename;
        if (oldFoto) {
          const filePath = path.join(__dirname, '..', 'public', 'image', 'products', oldFoto);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Eliminar la foto anterior
          }
        }
      }

      // Actualizar el producto en la base de datos
      conn.query('UPDATE PRODUCTO SET ? WHERE cod_producto = ?', [producto, id], (err) => {
        if (err) return res.status(500).send('Error al actualizar el producto');
        
        // Redirigir a la lista de productos después de la actualización
        res.redirect('/admin/products');
      });
    });
  });
}


// Eliminar producto
function deleteProduct(req, res) {
  const id = req.params.id;
  req.getConnection((err, conn) => {
    conn.query('SELECT foto FROM PRODUCTO WHERE cod_producto = ?', [id], (err, rows) => {
      const foto = rows[0]?.foto;
      conn.query('DELETE FROM PRODUCTO WHERE cod_producto = ?', [id], (err) => {
        if (foto) {
          const filePath = path.join(__dirname, '..', 'public', 'image', 'products', foto);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        res.redirect('/admin/products');
      });
    });
  });
}

module.exports = {
  saveCategory,
  listProducts,
  showAddForm,
  saveProduct,
  showEditForm,
  updateProduct,
  deleteProduct
};
