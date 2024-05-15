const mongoose = require('mongoose');
const { Schema } = mongoose;
const changeTypeSchema = new Schema({
    tipoCompra: { type: Number, required: true }, // El tipo de cambio para comprar dólares con soles
    tipoVenta: { type: Number, required: true }, // El tipo de cambio para vender dólares y recibir soles
    fechaActualizacion: { type: Date, default: Date.now } // Fecha de la última actualización
  }, { timestamps: true });
  
  module.exports = mongoose.model('ChangeType', changeTypeSchema);
  