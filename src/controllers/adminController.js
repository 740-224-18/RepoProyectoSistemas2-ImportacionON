const util = require('util');
const PDFDocument = require('pdfkit');
const stream = require('stream');

async function descargarPedidoPDF(req, res) {
  try {
    const pedidoId = req.params.id;
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    // Obtén los datos del pedido y productos
    const pedidos = await query(`
      SELECT 
        p.cod_pedido AS id,
        mp.nombre AS metodo_pago,
        p.metodo_pago_id,
        p.estado_id,
        p.fecha_pedido AS fecha,
        c.nombres AS cliente_nombre,
        c.apellidos AS cliente_apellido,
        dc.direccion,
        p.total
      FROM PEDIDO p
      JOIN CLIENTE c ON p.cliente_id = c.cod_cliente
      LEFT JOIN DIRECCION_CLIENTE dc ON p.direccion_entrega_id = dc.cod_direccion
      LEFT JOIN METODO_PAGO mp ON p.metodo_pago_id = mp.cod_metodo
      WHERE p.cod_pedido = ?
      LIMIT 1
    `, [pedidoId]);

    if (!pedidos.length) return res.status(404).send('Pedido no encontrado');
    const pedido = pedidos[0];
    const total = Number(pedido.total) || 0;

    const productos = await query(`
      SELECT 
        dp.cantidad,
        dp.precio_unitario AS precio,
        (dp.cantidad * dp.precio_unitario) AS subtotal,
        pr.nombre AS producto_nombre
      FROM DETALLE_PEDIDO dp
      JOIN PRODUCTO pr ON dp.producto_id = pr.cod_producto
      WHERE dp.pedido_id = ?
    `, [pedidoId]);

    const reciboExistente = await query(
      'SELECT * FROM RECIBO WHERE pedido_id = ?', [pedidoId]
    );

    if (!reciboExistente.length) {
      // 2. Si no existe, crea el recibo
      await query(
        `INSERT INTO RECIBO (pedido_id, monto_total, metodo_pago_id, detalle_extra)
         VALUES (?, ?, ?, ?)`,
        [
          pedidoId,
          pedido.total,
          pedido.metodo_pago_id, // Asegúrate de tener este dato en tu consulta
          'Recibo generado automáticamente al descargar el PDF'
        ]
      );
    }

    // Parámetros de ejemplo (ajusta según tu modelo)
    const fecha = new Date(pedido.fecha);
    const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}-${(fecha.getMonth()+1).toString().padStart(2, '0')}-${fecha.getFullYear()}`;
    const horaStr = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}:00`;

    // Crea el PDF
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=pedido_${pedido.id}.pdf`);
      res.send(pdfData);
    });

    // Usa fuente monoespaciada
    doc.font('Courier').fontSize(10);

    // Encabezado
    doc.text('VENTAS', 40, 40, { continued: true });
    doc.text('IMPORTACIONES ORGANICOS Y NATURALES S.R.L', 200, 40, { continued: true });
    doc.text(`No.Nota: ${pedido.id}`, 480, 40);
    doc.text(fechaStr, 40, 55, { continued: true });
    doc.text('N O T A   D E   D E S P A C H O', 200, 55, { continued: true });
    doc.text(`Fecha : ${fechaStr}`, 480, 55);
    doc.text(horaStr, 40, 70, { continued: true });
    doc.text('No Valido Como Factura - Exija su Factura', 200, 70, { continued: true });
    doc.text('No.Doc.:', 480, 70);
    doc.text(`Pagina : 1  Cliente : ${pedido.cliente_nombre} ${pedido.cliente_apellido}  -  Direccion: ${pedido.direccion}`, 40, 85);

    doc.text('---------------------------------------------------------------------------------------------------------------', 40, 100);
    doc.text('Articulo   Descripcion                Lote   U/M   Cantidad   Precio   Subtotal   %   Descuento   Total Bs.', 40, 115);
    doc.text('---------------------------------------------------------------------------------------------------------------', 40, 130);

    // Productos
    let y = 145;
    productos.forEach(prod => {
      const precio = Number(prod.precio) || 0;
      const subtotal = Number(prod.subtotal) || 0;
      doc.text(
        `${'50105'.padEnd(10)}${prod.producto_nombre.padEnd(28)}${''.padEnd(7)}${'UNI'.padEnd(6)}${String(prod.cantidad).padEnd(10)}${precio.toFixed(2).padEnd(9)}${subtotal.toFixed(2).padEnd(11)}${'5.00'.padEnd(5)}${'1,875.00'.padEnd(11)}${total.toFixed(2)}`,
        40, y
      );
      y += 15;
    });

    doc.text('---------------------------------------------------------------------------------------------------------------', 40, y);
    y += 15;

    // Resumen
    doc.text(`Almacen : 1   ALMACEN ----WARNES`, 40, y); y += 15;
    doc.text(`Local   : 1   VENTAS INTERNAS`, 40, y); y += 15;
    doc.text(`Zona    : 1   SANTA CRUZ`, 40, y); y += 15;
    doc.text(`Vendedor: 1   GUERHY ANTONIO ARANCIBIA QUINTA`, 40, y); y += 15;
    doc.text(`Efectivo:      ${total.toFixed(2)}`, 40, y); y += 15;
    doc.text(`Detalle : venta de ${productos[0]?.producto_nombre || ''} para el departamento`, 40, y); y += 15;
    doc.text(`         de Santa Cruz de la sierra`, 40, y); y += 30;

    // Firmas
    doc.text('--------------------------           --------------------------           --------------------------', 40, y);
    y += 15;
    doc.text('    *    Despachante    *                * Sup ventas santa cruz *                *   Interesado   *', 40, y);

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send('Error al generar PDF');
  }
}

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
        WHERE p.estado_id = 1
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
async function completarPedido(req, res) {
  try {
    const pedidoId = req.params.id;
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    // Cambia estado a completado SOLO si está pendiente
    const pedido = await query('SELECT estado_id FROM PEDIDO WHERE cod_pedido = ?', [pedidoId]);
    if (!pedido.length || pedido[0].estado_id !== 1) {
      return res.status(400).json({ error: 'Pedido no válido' });
    }

    // Descontar stock de productos
    const productos = await query('SELECT producto_id, cantidad FROM DETALLE_PEDIDO WHERE pedido_id = ?', [pedidoId]);
    for (const p of productos) {
      await query('UPDATE PRODUCTO SET stock = stock - ? WHERE cod_producto = ?', [p.cantidad, p.producto_id]);
    }

    // Cambiar estado a completado (2)
    await query('UPDATE PEDIDO SET estado_id = 2, fecha_entrega = NOW() WHERE cod_pedido = ?', [pedidoId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al completar pedido:', err);
    res.status(500).json({ error: 'Error al completar pedido' });
  }
}
async function pedidosCompletados(req, res) {
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
        dc.direccion,
        p.total
      FROM PEDIDO p
      JOIN CLIENTE c ON p.cliente_id = c.cod_cliente
      LEFT JOIN DIRECCION_CLIENTE dc ON p.direccion_entrega_id = dc.cod_direccion
      LEFT JOIN METODO_PAGO mp ON p.metodo_pago_id = mp.cod_metodo
      WHERE p.estado_id = 2
      ORDER BY p.fecha_pedido DESC
    `);

    const pedidosConCliente = pedidos.map(p => ({
      ...p,
      cliente: { nombre: p.nombre, direccion: p.direccion },
      estado: 'completado'
    }));

    res.render('admin/orders_completed', { pedidos: pedidosConCliente });
  } catch (error) {
    console.error('Error al mostrar pedidos completados:', error);
    res.status(500).send('Error al mostrar pedidos completados');
  }
}

async function dashboard(req, res) {
  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    // Selector de días (7 o 30)
    const dias = Number(req.query.dias) === 30 ? 30 : 7;

    // Pedidos de hoy
    const pedidosHoy = await query(`SELECT COUNT(*) AS total FROM PEDIDO WHERE DATE(fecha_pedido) = CURDATE()`);
    // Ingresos de hoy
    const ingresosHoy = await query(`SELECT IFNULL(SUM(total),0) AS total FROM PEDIDO WHERE DATE(fecha_pedido) = CURDATE() AND estado_id = 2`);
    // Total productos
    const totalProductos = await query(`SELECT COUNT(*) AS total FROM PRODUCTO`);
    // Total empleados
    const totalEmpleados = await query(`SELECT COUNT(*) AS total FROM EMPLEADO`);
    // Pedidos recientes (últimos 5)
    const pedidosRecientes = await query(`
      SELECT cod_pedido AS id, DATE_FORMAT(fecha_pedido, '%d/%m/%Y %H:%i') AS fecha, 
        (CASE estado_id WHEN 1 THEN 'pendiente' WHEN 2 THEN 'completado' WHEN 3 THEN 'cancelado' ELSE 'otro' END) AS estado
      FROM PEDIDO
      ORDER BY fecha_pedido DESC
      LIMIT 5
    `);

    // Para el gráfico de ventas por producto (top 5 vendidos)
    const ventasPorProducto = await query(`
      SELECT pr.nombre, SUM(dp.cantidad) AS cantidad
      FROM DETALLE_PEDIDO dp
      JOIN PRODUCTO pr ON dp.producto_id = pr.cod_producto
      JOIN PEDIDO p ON dp.pedido_id = p.cod_pedido
      WHERE p.estado_id = 2
      GROUP BY pr.cod_producto
      ORDER BY cantidad DESC
      LIMIT 5
    `);

    // Para el gráfico de ingresos por día (últimos 7 o 30 días)
    const ingresosPorDia = await query(`
      SELECT DATE(fecha_pedido) AS fecha, SUM(total) AS total
      FROM PEDIDO
      WHERE estado_id = 2
      GROUP BY DATE(fecha_pedido)
      ORDER BY fecha DESC
      LIMIT ?
    `, [dias]);

    res.render('admin/dashboard', {
      nombre: req.session.nombre,
      user: req.session.user,
      pedidosHoy: pedidosHoy[0].total,
      ingresosHoy: ingresosHoy[0].total,
      totalProductos: totalProductos[0].total,
      totalEmpleados: totalEmpleados[0].total,
      pedidosRecientes,
      ventasPorProducto,
      ingresosPorDia,
      diasSeleccionados: dias
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).send('Error en dashboard');
  }
}

async function historialInventario(req, res) {
  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    const historial = await query(`
      SELECT hi.*, pr.nombre AS producto, im.nombre AS movimiento, e.nombres AS empleado
      FROM HISTORIAL_INVENTARIO hi
      LEFT JOIN PRODUCTO pr ON hi.producto_id = pr.cod_producto
      LEFT JOIN INVENTARIO_MOVIMIENTO im ON hi.movimiento_id = im.cod_movimiento
      LEFT JOIN EMPLEADO e ON hi.empleado_id = e.cod_empleado
      ORDER BY hi.fecha_movimiento DESC
      LIMIT 100
    `);

    res.render('admin/historial_inventario', { historial });
  } catch (error) {
    console.error('Error en historial inventario:', error);
    res.status(500).send('Error en historial inventario');
  }
}

async function reporteSemanal(req, res) {
  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    // Última semana
    const reporte = await query(`
      SELECT * FROM REPORTE_SEMANAL
      ORDER BY fecha_generado DESC
      LIMIT 1
    `);

    res.render('admin/reporte_semanal', { reporte: reporte[0] });
  } catch (error) {
    console.error('Error en reporte semanal:', error);
    res.status(500).send('Error en reporte semanal');
  }
}

module.exports = { 
  mostrarPedidos,
  detallePedido,
  completarPedido,
  pedidosCompletados,
  descargarPedidoPDF,
  dashboard,
  historialInventario,
  reporteSemanal
};