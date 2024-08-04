const Transaction = require('../models/Transaction');
const ChangeType = require('../models/ChangeType'); // Asume que este es tu modelo para tipos de cambio
const User = require('../models/User');
const {Resend} = require('resend');
const environments = require('../config/environments');
const resend = new Resend(environments.APIKEY_RESEND);
const PDFDocument = require('pdfkit');
const fs = require('fs');
const shortid = require('shortid');




exports.downloadTransactionsReport = async (req, res) => {
  const uid = req.user.uid;
  const user = await User.findById(uid);
  if (!user || user.rol !== 'admin') {
    return res.status(403).send('Acceso denegado. Sólo los administradores pueden realizar esta acción.');
  }

  const { dateRange } = req.query;
  let query = { estado: 'culminado' };
  adjustDateRangeQuery(query, dateRange);

  const transactions = await Transaction.find(query);
  if (transactions.length === 0) {
    return res.status(404).send('No transactions completed in this period');
  }

  // Crear el documento PDF y enviarlo al cliente
  const doc = new PDFDocument();
  res.setHeader('Content-disposition', 'attachment; filename="transactions-report.pdf"');
  res.setHeader('Content-type', 'application/pdf');
  doc.pipe(res);

  doc.fontSize(16).text('Transactions Report', { align: 'center' }).moveDown();
  doc.fontSize(12).text('ID', 70).text('Operation', 150).text('Sent', 280).text('Received', 410).text('Bank', 540).moveDown(0.5);
  transactions.forEach(t => {
    doc.text(t.idTransaction, 70).text(t.tipoOperacion.replace('tipo', ''), 150).text(`${t.cantidadEnvio}`, 280).text(`${t.cantidadRecepcion}`, 410).text(t.bancoDestino, 540).moveDown(0.5);
  });

  doc.end();
};

function adjustDateRangeQuery(query, dateRange) {
  const now = new Date();
  if (dateRange === 'today') {
    query.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)), $lte: new Date(now.setHours(23, 59, 59, 999)) };
  } else if (dateRange === 'week') {
    let start = now.getDate() - now.getDay();
    let end = start + 6; // Last day of the week
    query.createdAt = { $gte: new Date(now.setDate(start)), $lte: new Date(now.setDate(end)) };
  }
}



exports.verifyTipoCambio = async (req, res) => {
  console.log(req.body)
  try {
  
    const {tipoCambio, tipoOperacion } = req.body;
    const currentChangeType = await ChangeType.findOne(); // Obtén el tipo de cambio actual
    const currentTipoCambio = tipoOperacion === 'tipoCompra' ? currentChangeType.tipoCompra : currentChangeType.tipoVenta;

    // Comprueba si el tipo de cambio enviado coincide con el actual
   
    if (tipoCambio !== currentTipoCambio) {
      return res.json({ hasChanged: true, currentTipoCambio, currentChangeType });
    } else {
      return res.json({ hasChanged: false, currentTipoCambio, currentChangeType });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al verificar el tipo de cambio');
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const usuarioId = req.user.uid;
    const { tipoOperacion, cantidadEnvio, numeroCuentaInterbancario, tipoCuenta, bancoDestino } = req.body;
    const currentChangeType = await ChangeType.findOne();
    const tipoCambio = tipoOperacion === 'tipoCompra' ? currentChangeType.tipoCompra : currentChangeType.tipoVenta;
    const cantidadRecepcion = calcularCantidadRecepcion(cantidadEnvio, tipoCambio, tipoOperacion);

    // Generar un ID de transacción corto
    const idTransaction = shortid.generate();

    const newTransaction = new Transaction({
      usuarioId,
      tipoOperacion,
      tipoCambio,
      estado: 'espera',
      cantidadEnvio,
      cantidadRecepcion,
      numeroCuentaInterbancario,
      tipoCuenta,
      bancoDestino,
      idTransaction 
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear la transacción');
  }
};



exports.updateTransaction = async (req, res) => {
  try {
    const { numeroOperacion } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).send('Transacción no encontrada');
    }

    // Actualiza la transacción con el número de operación y cambia el estado a 'pendiente'
    transaction.numeroOperacion = numeroOperacion;
    transaction.estado = 'pendiente';
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar la transacción');
  }
};

exports.cancelTransaction = async (req, res) => {
  try {
    const { comentario } = req.body; // Comentario es opcional
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).send('Transacción no encontrada');
    }

    // Cancela la transacción y añade un comentario si se proporciona
    transaction.estado = 'cancelado';
    if (comentario) transaction.comentario = comentario;
    await transaction.save();

    res.json({ message: 'Transacción cancelada', transaction });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cancelar la transacción');
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const uid = req.user.uid; // Usas el UID obtenido por tu middleware de autenticación
    const user = await User.findById(uid); // Buscas el usuario en la base de datos para obtener su rol

    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    let query;
    if (user.rol === 'admin') {
      // Si el usuario es un administrador, puede ver todas las transacciones
      query = {};
    } else {
      // Si no es administrador, solo puede ver sus propias transacciones
      query = { usuarioId: uid };
    }

    const transactions = await Transaction.find(query)
      .populate('usuarioId', 'nombre apellido dni'); // Población de datos del usuario

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener las transacciones');
  }
};


exports.completeTransaction = async (req, res) => {
  try {
    const uid = req.user.uid; // Usas el UID obtenido por tu middleware de autenticación
    const userRole = await User.findById(uid); // Buscas el usuario en la base de datos para obtener su rol
    console.log(req.body);
    const { comentario, imagen } = req.body; // Información proporcionada en la solicitud
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);
    if(userRole.rol !== 'admin'){
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }
    if (!transaction) {
      return res.status(404).send('Transacción no encontrada');
    }

    if (transaction.estado === 'culminado' || transaction.estado === 'cancelado') {
      return res.status(400).send('La transacción no puede modificarse en su estado actual');
    }

    if (!imagen) {
      return res.status(400).send('Se requiere una imagen para completar la transacción');
    }

    // Buscar información del usuario para enviar el correo
    const user = await User.findById(transaction.usuarioId);
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    // Preparar el correo electrónico de confirmación
    const htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .header { color: #2E5984; font-size: 20px; font-weight: bold; }
        .info { background-color: #f2f2f2; padding: 10px; border-radius: 5px; }
        .footer { margin-top: 20px; font-size: 16px; color: #444; }
      </style>
    </head>
    <body>
      <div class="header">Confirmación de Transacción</div>
      <p>Estimado ${user.nombre},</p>
      <p>Tu transacción ha sido completada exitosamente con los siguientes detalles:</p>
      <div class="info">
        <p><strong>Tipo de Operación:</strong> ${transaction.tipoOperacion === 'tipoCompra' ? 'Compra' : 'Venta'}</p>
        <p><strong>Cantidad Enviada:</strong> ${transaction.cantidadEnvio} ${transaction.tipoOperacion === 'tipoCompra' ? 'PEN' : 'USD'}</p>
        <p><strong>Cantidad Recibida:</strong> ${transaction.cantidadRecepcion} ${transaction.tipoOperacion === 'tipoCompra' ? 'USD' : 'PEN'}</p>
        <p><strong>Banco Destino:</strong> ${transaction.bancoDestino}</p>
        <p><strong>Número de Cuenta:</strong> ${transaction.numeroCuentaInterbancario}</p>
      </div>
      <div class="footer">
        Gracias por usar nuestros servicios. Si tienes alguna pregunta, no dudes en contactarnos.
      </div>
    </body>
    </html>
    `;  // Tu HTML aquí

    // Intentar enviar el correo electrónico
    // Intentar enviar el correo electrónico
    const { data, error } = await resend.emails.send({
      from: 'Cambialo <carlos.amorin@cambialo.com.pe>',  // Usar una dirección bajo tu dominio verificado
      to: [user.email],  // Ahora puedes enviar a cualquier correo
      subject: 'Confirmación de Transacción',
      html: htmlContent
    });


    if (error) {
      console.error(error);
      return res.status(500).send('Error al enviar el correo electrónico');
    }

    // Actualizar y guardar la transacción solo si el correo fue enviado exitosamente
    transaction.imagen = imagen;
    if (comentario) transaction.comentario = comentario;
    transaction.estado = 'culminado';
    await transaction.save();

    res.json({ message: 'Transacción culminada y correo enviado con éxito', transaction, emailInfo: data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar el estado de la transacción');
  }
};

// Asegúrate de implementar esta función según tu lógica de negocio para calcular la cantidad de recepción
function calcularCantidadRecepcion(cantidadEnvio, tipoCambio,tipoOperacion) {
  // Esta es una implementación de ejemplo. Debes ajustarla según tu caso de uso específico.

  if(tipoOperacion === 'tipoCompra'){
    return (cantidadEnvio / tipoCambio).toFixed(3);
  }
  else if(tipoOperacion === 'tipoVenta'){
    return (cantidadEnvio * tipoCambio).toFixed(3) ;
  }

}
