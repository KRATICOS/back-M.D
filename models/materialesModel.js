const mongoose = require('mongoose');
const QRCode = require('qrcode');

const materialSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['Disponible', 'Ocupado', 'En Mantenimiento'],
    default: 'Disponible'
  },
  imagenes: [{
    url: String
  }],
  codigoserie: {
    type: String,
    required: true,
    unique: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  codigoqr: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

materialSchema.pre('save', async function (next) {
  if (!this.codigoqr) {
    const qrData = `http://localhost:3001/materiales/${this._id}`;
    try {
      this.codigoqr = await QRCode.toDataURL(qrData); // genera QR en base64
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Material', materialSchema);
