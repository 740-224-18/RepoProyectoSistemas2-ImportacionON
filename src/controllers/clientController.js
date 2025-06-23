const util = require('util');
const PDFDocument = require('pdfkit');
const stream = require('stream');

async function descargarPedidoPDF(req, res) {
  try {
    const pedidoId = req.params.id;
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    // Obtén los datos del pedido y productos (igual que en detallePedido)
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
      WHERE p.cod_pedido = ?
      LIMIT 1
    `, [pedidoId]);

    if (!pedidos.length) return res.status(404).send('Pedido no encontrado');
    const pedido = pedidos[0];

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

    // Crea el PDF
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=pedido_${pedido.id}.pdf`);
      res.send(pdfData);
    });

    // Contenido del PDF
    doc.fontSize(20).text(`Recibo de Pedido #${pedido.id}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Cliente: ${pedido.nombre}`);
    doc.text(`Dirección: ${pedido.direccion}`);
    doc.text(`Método de pago: ${pedido.metodo_pago}`);
    doc.text(`Fecha: ${pedido.fecha}`);
    doc.moveDown();

    doc.fontSize(14).text('Productos:', { underline: true });
    doc.moveDown(0.5);

    productos.forEach(p => {
      doc.fontSize(12).text(
        `${p.producto_nombre} - Cantidad: ${p.cantidad} - Precio: Bs ${p.precio} - Subtotal: Bs ${p.subtotal}`
      );
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: Bs ${pedido.total}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send('Error al generar PDF');
  }
}

async function showRegisterClient(req, res) {
  if (!req.session.loggedin) return res.redirect('/login');
  res.render('pages/registerClient', {
    nombre: req.session.nombre,
    email: req.session.email || '',
    cod_registro: req.session.cod_registro
  });
}

async function storeClient(req, res) {
  if (!req.session.loggedin) return res.status(401).send('No autorizado');
  const data = req.body;

  try {
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    // Verifica si ya existe cliente para este usuario
    const existing = await query('SELECT * FROM CLIENTE WHERE usuario_id = ?', [req.session.cod_registro]);
    if (existing.length > 0) {
      return res.render('pages/registerClient', { error: 'Ya tienes un perfil de cliente registrado.' });
    }

    // Insertar en CLIENTE
    const cliente = {
      usuario_id: req.session.cod_registro,
      nombres: data.nombres,
      apellidos: data.apellidos,
      ci_o_nit: data.ci_o_nit,
      celular: data.celular,
      fecha_nacimiento: data.fecha_nacimiento,
      genero_id: data.genero_id
    };
    const result = await query('INSERT INTO CLIENTE SET ?', cliente);
    const cliente_id = result.insertId;

    // Insertar dirección principal
    const direccion = {
      cliente_id,
      direccion: data.direccion,
      ciudad: data.ciudad,
      departamento_id: data.departamento_id || null,
      pais_id: data.pais_id || null,
      codigo_postal: data.codigo_postal,
      referencia: data.referencia
    };
    await query('INSERT INTO DIRECCION_CLIENTE SET ?', direccion);

    // Actualiza la sesión para indicar que ya es cliente
    req.session.cliente_id = cliente_id;

    res.redirect('/productos');
  } catch (err) {
    console.error('Error al registrar cliente:', err);
    res.render('pages/registerClient', { error: 'Error al registrar cliente.' });
  }
}
async function verRecibo(req, res) {
  try {
    const pedidoId = req.params.id;
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    // Verifica que el pedido sea del cliente logueado
    const pedidos = await query(`
      SELECT p.*, mp.nombre AS metodo_pago, dc.direccion, c.nombres, c.apellidos
      FROM PEDIDO p
      JOIN CLIENTE c ON p.cliente_id = c.cod_cliente
      LEFT JOIN DIRECCION_CLIENTE dc ON p.direccion_entrega_id = dc.cod_direccion
      LEFT JOIN METODO_PAGO mp ON p.metodo_pago_id = mp.cod_metodo
      WHERE p.cod_pedido = ? AND p.cliente_id = ?
      LIMIT 1
    `, [pedidoId, req.session.cliente_id]);

    if (!pedidos.length) return res.status(404).send('Recibo no encontrado');

    const pedido = pedidos[0];

    const productos = await query(`
      SELECT dp.cantidad, dp.precio_unitario, dp.subtotal, pr.nombre AS producto_nombre
      FROM DETALLE_PEDIDO dp
      JOIN PRODUCTO pr ON dp.producto_id = pr.cod_producto
      WHERE dp.pedido_id = ?
    `, [pedidoId]);

    res.render('pages/recibo', { pedido, productos });
  } catch (err) {
    console.error('Error al mostrar recibo:', err);
    res.status(500).send('Error al mostrar recibo');
  }
}

module.exports = {
  showRegisterClient,
  storeClient, 
  verRecibo,
  descargarPedidoPDF
};