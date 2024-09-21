
const mongoose = require('mongoose');
const { Schema } = mongoose;

const usuarioSchema = new Schema({
  _id: { type: String, required: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  dni: { type: String, required: true, unique: true },
  email: { type: String, required: false},
  rol: { type: String, default: 'usuario', enum: ['usuario', 'admin'] },
  cc: { type: String, required: false },
  cci: { type: String, required: false },
  // Otros campos relevantes para tu aplicación...
}, { timestamps: true });

module.exports = mongoose.model('User', usuarioSchema);


