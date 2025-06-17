const util = require('util');

async function mostrarPedidos(req, res) {
  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    const pedidos = await query(`
      SELECT 
        p.cod_pedido AS id,
        mp.nombre AS metodo_pago,
        p.estado_id,
        p.fecha_pedido AS fecha,
        c.nombres AS nombre,
        dc.direccion
      FROM PEDIDO p
      JOIN CLIENTE c ON p.cliente_id = c.cod_cliente
      LEFT JOIN DIRECCION_CLIENTE dc ON p.direccion_entrega_id = dc.cod_direccion
      LEFT JOIN METODO_PAGO mp ON p.metodo_pago_id = mp.cod_metodo
      ORDER BY p.fecha_pedido DESC
    `);

    const pedidosConCliente = pedidos.map(p => ({
      ...p,
      cliente: { nombre: p.nombre, direccion: p.direccion },
      estado: p.estado_id === 1 ? 'pendiente' : (p.estado_id === 2 ? 'completado' : 'cancelado')
    }));

    res.render('admin/orders', { pedidos: pedidosConCliente });
  } catch (error) {
    console.error('Error al mostrar pedidos:', error);
    res.status(500).send('Error al mostrar pedidos');
  }
}

async function detallePedido(req, res) {
  try {
    const pedidoId = req.params.id;
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    // Obtener datos del pedido y cliente
    const pedidos = await query(`
      SELECT 
        p.cod_pedido AS id,
        mp.nombre AS metodo_pago,
        p.estado_id,
        p.fecha_pedido AS fecha,
        c.nombres AS nombre,
        dc.direccion
      FROM PEDIDO p
      JOIN CLIENTE c ON p.cliente_id = c.cod_cliente
      LEFT JOIN DIRECCION_CLIENTE dc ON p.direccion_entrega_id = dc.cod_direccion
      LEFT JOIN METODO_PAGO mp ON p.metodo_pago_id = mp.cod_metodo
      WHERE p.cod_pedido = ?
      LIMIT 1
    `, [pedidoId]);

    if (!pedidos.length) {
      return res.status(404).send('Pedido no encontrado');
    }

    const pedido = pedidos[0];
    pedido.cliente = { nombre: pedido.nombre, direccion: pedido.direccion };
    pedido.estado = pedido.estado_id === 1 ? 'pendiente' : (pedido.estado_id === 2 ? 'completado' : 'cancelado');

    // Obtener productos del pedido usando la tabla correcta DETALLE_PEDIDO
    const productos = await query(`
      SELECT 
        dp.cantidad,
        dp.precio_unitario AS precio,
        (dp.cantidad * dp.precio_unitario) AS subtotal,
        pr.nombre AS producto_nombre,
        pr.foto AS imagen
      FROM DETALLE_PEDIDO dp
      JOIN PRODUCTO pr ON dp.producto_id = pr.cod_producto
      WHERE dp.pedido_id = ?
    `, [pedidoId]);

    res.render('admin/pedido_detalle', { pedido, productos });
  } catch (error) {
    console.error('Error al mostrar detalle del pedido:', error);
    res.status(500).send('Error al mostrar detalle del pedido');
  }
}

module.exports = { 
  mostrarPedidos,
  detallePedido
};