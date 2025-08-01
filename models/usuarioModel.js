const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre_usuario: { type: String, required: true, trim: true },
  matricula: { type: String, required: true, unique: true, trim: true },
  contrasena: { type: String, required: true },
  grupo: { type: String, required: true, trim: true },
  carrera: { type: String, required: true, trim: true },
  rol: {
    type: String,
    enum: ['usuario', 'superadministrador'],
    default: 'usuario'
  },
  imagenes: [{
    url: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Usuario', usuarioSchema);
