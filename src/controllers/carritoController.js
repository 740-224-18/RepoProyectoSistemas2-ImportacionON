const util = require('util');

async function agregarProducto(req, res) {
  try {
    const { producto_id } = req.body;
    if (!producto_id) return res.redirect('/productos');

    if (!req.session.cart) {
      req.session.cart = {};
    }

    if (req.session.cart[producto_id]) {
      req.session.cart[producto_id]++;
    } else {
      req.session.cart[producto_id] = 1;
    }

    req.flash('success_msg', 'Producto agregado al carrito');
    res.redirect('/productos');
  } catch (error) {
    console.error('Error en agregarProducto:', error);
    res.status(500).send('Error al agregar producto al carrito');
  }
}

async function mostrarCarrito(req, res) {
  try {
    const cart = req.session.cart || {};
    const productIds = Object.keys(cart);

    if (productIds.length === 0) {
      return res.render('pages/carrito', { productos: [], total: 0 });
    }

    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    const placeholders = productIds.map(() => '?').join(',');
    const sql = `SELECT cod_producto, nombre, precio, stock, foto FROM PRODUCTO WHERE cod_producto IN (${placeholders})`;

    const productos = await query(sql, productIds);

    let total = 0;
    const productosConCantidad = productos.map(p => {
      const cantidad = cart[p.cod_producto];
      const subtotal = p.precio * cantidad;
      total += subtotal;
      return { ...p, cantidad, subtotal };
    });

    // Obtener datos del cliente para el recibo (nombre completo, celular y dirección)
    let cliente = {};
    if (req.session.cliente_id) {
      const clientes = await query(
        `SELECT c.nombres, c.apellidos, c.celular, dc.direccion
         FROM CLIENTE c
         LEFT JOIN DIRECCION_CLIENTE dc ON c.cod_cliente = dc.cliente_id
         WHERE c.cod_cliente = ?
         LIMIT 1`,
        [req.session.cliente_id]
      );
      if (clientes.length > 0) {
        const c = clientes[0];
        cliente = {
          nombre: `${c.nombres} ${c.apellidos}`,
          telefono: c.celular,
          direccion: c.direccion || ''
        };
      }
    }

    res.render('pages/carrito', {
      productos: productosConCantidad,
      total,
      nombre: req.session.nombre,
      rol: req.session.rolNombre,
      loggedin: req.session.loggedin,
      cliente // <-- pasa los datos del cliente
    });
  } catch (error) {
    console.error('Error en mostrarCarrito:', error);
    res.status(500).send('Error al mostrar el carrito');
  }
}

async function confirmarCompra(req, res) {
  let conn;
  try {
    const cart = req.session.cart || {};
    if (Object.keys(cart).length === 0) {
      req.flash('error_msg', 'El carrito está vacío');
      return res.redirect('/carrito');
    }

    const { metodo_pago } = req.body;
    if (!metodo_pago) {
      req.flash('error_msg', 'Debe seleccionar un método de pago');
      return res.redirect('/carrito');
    }

    const getConnection = util.promisify(req.getConnection).bind(req);
    conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);
    const beginTransaction = util.promisify(conn.beginTransaction).bind(conn);
    const commit = util.promisify(conn.commit).bind(conn);
    const rollback = util.promisify(conn.rollback).bind(conn);

    await beginTransaction();

    const cliente_id = req.session.cliente_id || null;

    // Obtener el id del método de pago
    const metodoPagoRow = await query('SELECT cod_metodo FROM METODO_PAGO WHERE nombre = ?', [metodo_pago]);
    const metodo_pago_id = metodoPagoRow.length > 0 ? metodoPagoRow[0].cod_metodo : null;

    // Obtener la dirección principal del cliente
    let direccion_entrega_id = null;
    const direccionRow = await query(
      'SELECT cod_direccion FROM DIRECCION_CLIENTE WHERE cliente_id = ? LIMIT 1',
      [cliente_id]
    );
    if (direccionRow.length > 0) {
      direccion_entrega_id = direccionRow[0].cod_direccion;
    }

    // Calcula el total del pedido
    let total = 0;
    for (const productoId of Object.keys(cart)) {
      const productos = await query('SELECT precio FROM PRODUCTO WHERE cod_producto = ?', [productoId]);
      if (productos.length > 0) {
        total += productos[0].precio * cart[productoId];
      }
    }

    const pedido = {
      cliente_id,
      estado_id: 1, // Pendiente
      fecha_pedido: new Date(),
      metodo_pago_id,
      direccion_entrega_id,
      total
    };

    const resultPedido = await query('INSERT INTO PEDIDO SET ?', pedido);
    const pedidoId = resultPedido.insertId;

    for (const productoId of Object.keys(cart)) {
      const cantidad = cart[productoId];

      const productos = await query('SELECT precio, stock FROM PRODUCTO WHERE cod_producto = ?', [productoId]);
      const producto = productos[0];

      if (!producto || producto.stock < cantidad) {
        throw new Error(`Stock insuficiente para el producto ID ${productoId}`);
      }

      await query('INSERT INTO DETALLE_PEDIDO SET ?', {
        pedido_id: pedidoId,
        producto_id: productoId,
        cantidad,
        precio_unitario: producto.precio,
        subtotal: producto.precio * cantidad
      });

      await query('UPDATE PRODUCTO SET stock = stock - ? WHERE cod_producto = ?', [cantidad, productoId]);
    }

    await commit();

    req.session.cart = {};
    req.flash('success_msg', `Compra confirmada con éxito. Método de pago: ${metodo_pago}`);
    res.redirect('/carrito/confirmado');
  } catch (error) {
    try {
      if (conn) {
        const rollback = util.promisify(conn.rollback).bind(conn);
        await rollback();
      }
    } catch (rollbackError) {
      console.error('Error en rollback:', rollbackError);
    }
    console.error('Error en confirmarCompra:', error);
    req.flash('error_msg', `Error al confirmar compra: ${error.message}`);
    res.redirect('/carrito');
  }
}

function mostrarConfirmacion(req, res) {
  res.render('pages/confirmado', { mensaje: req.flash('success_msg') });
}

module.exports = {
  agregarProducto,
  mostrarCarrito,
  confirmarCompra,
  mostrarConfirmacion
};