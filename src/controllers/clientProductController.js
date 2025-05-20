const path = require('path');

// Listar productos para clientes con búsqueda
function listClientProducts(req, res) {
  let searchQuery = req.query.search || '';  // Captura la búsqueda de la URL
  const searchParam = `%${searchQuery}%`;    // Para usar en LIKE

  req.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    let query = `
      SELECT PRODUCTO.*, CATEGORIA.nombre AS categoria_nombre 
      FROM PRODUCTO 
      INNER JOIN CATEGORIA ON PRODUCTO.cod_cat = CATEGORIA.cod_cat
    `;

    const params = [];

    if (searchQuery) {
      query += ' WHERE PRODUCTO.nombre LIKE ?';
      params.push(searchParam);
    }

    conn.query(query, params, (err, productos) => {
      if (err) {
        return res.status(500).send('Error al obtener productos');
      }

      res.render('pages/productos', {
        productos,
        searchQuery,
        active: { productos: true },
        nombre: req.session.nombre || null
      });
    });
  });
}

module.exports = {
  listClientProducts
};
