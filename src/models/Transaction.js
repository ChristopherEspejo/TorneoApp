const mongoose = require('mongoose');
const shortid = require('shortid');
const { Schema } = mongoose;

const transactionSchema = new Schema({
  idTransaction: { type: String, default: shortid.generate },
  usuarioId: { type: String, ref: 'User', required: true },
  numeroOperacion: { type: String, required: false },
  tipoOperacion: { type: String, required: true, enum: ['tipoCompra', 'tipoVenta'] },
  tipoCambio: { type: Number, required: true },
  bancoDestino: { type: String, required: false },
  estado: { type: String, default: 'espera', enum: ['espera', 'pendiente', 'culminado', 'cancelado'] },
  cantidadEnvio: { type: Number, required: true },
  imagen: { type: String, required: false },
  cantidadRecepcion: { type: Number, required: true },
  numeroCuentaInterbancario: { type: String, required: true },
  tipoCuenta: { type: String, required: true, enum: ['ahorro', 'corriente'] },
  comentario: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
