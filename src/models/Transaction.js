const mongoose = require('mongoose');
const { Schema } = mongoose;



const transactionSchema = new Schema({
  usuarioId: { type: String, ref: 'User', required: true },
  numeroOperacion: { type: String, required: false }, // No requerido en la creación
  tipoOperacion: { type: String, required: true, enum: ['tipoCompra', 'tipoVenta'] },
  tipoCambio:{ type: Number, required: true},
  bancoDestino:{type: String, required: false},
  estado: { type: String, default: 'espera', enum: ['espera', 'pendiente', 'culminado', 'cancelado'] },
  cantidadEnvio: { type: Number, required: true },
  imagen: { type: String, required: false },
  cantidadRecepcion: { type: Number, required: true }, // Se calculará y llenará internamente
  numeroCuentaInterbancario: { type: String, required: true },
  tipoCuenta: { type: String, required: true, enum: ['ahorro', 'corriente'] },
  comentario: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
