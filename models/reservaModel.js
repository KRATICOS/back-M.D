const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  id_material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  Hora1: { type: Boolean, default: false }, // 7:00am-8:00am
  Hora2: { type: Boolean, default: false }, // 8:00am-9:00am
  Hora3: { type: Boolean, default: false }, // 9:00am-10:00am
  Hora4: { type: Boolean, default: false }, // 10:00am-11:00am
  Hora5: { type: Boolean, default: false }, // 11:00am-12:00pm
  Hora6: { type: Boolean, default: false }, // 12:00pm-1:00pm
  Hora7: { type: Boolean, default: false }, // 1:00pm-2:00pm
  Hora8: { type: Boolean, default: false }, // 2:00pm-3:00pm
  Hora9: { type: Boolean, default: false }, // 3:00pm-4:00pm
  Hora10: { type: Boolean, default: false }, // 4:00pm-5:00pm
  Hora11: { type: Boolean, default: false } // 5:00pm-6:00pm
}, { timestamps: true });

module.exports = mongoose.model('Reserva', reservaSchema);
