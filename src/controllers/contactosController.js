const util = require('util');

exports.guardarContacto = async (req, res) => {
  try {
    const { nombre, correo, telefono, mensaje } = req.body;
    const getConnection = util.promisify(req.getConnection).bind(req);
    const conn = await getConnection();
    const query = util.promisify(conn.query).bind(conn);

    await query('INSERT INTO contactos (nombre, correo, telefono, mensaje) VALUES (?, ?, ?, ?)', [
      nombre, correo, telefono, mensaje
    ]);

    res.redirect('/contactos?enviado=1');
  } catch (error) {
    console.error('Error al guardar contacto:', error);
    res.status(500).send('Error al enviar el mensaje');
  }
};