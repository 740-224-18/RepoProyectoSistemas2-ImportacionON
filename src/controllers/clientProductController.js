const path = require('path');

// Listar productos para clientes con búsqueda
function listClientProducts(req, res) {
  const searchQuery = req.query.search || '';  // Captura la búsqueda de la URL
  req.getConnection((err, conn) => {
    let query = 'SELECT * FROM PRODUCTO INNER JOIN CATEGORIA ON PRODUCTO.cod_cat = CATEGORIA.cod_cat';
    if (searchQuery) {
      query += ' WHERE PRODUCTO.nombre LIKE ?';
      searchQuery = `%${searchQuery}%`;  // Realiza la búsqueda con comodines
    }

    conn.query(query, [searchQuery], (err, productos) => {
      if (err) {
        return res.status(500).send('Error al obtener productos');
      }
      
      res.render('pages/productos', {
        productos,
        searchQuery,
        active: { productos: true },
        nombre: req.session.nombre
      });
    });
  });
}

module.exports = {
  listClientProducts
};
