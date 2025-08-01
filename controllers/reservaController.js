const Reserva = require('../models/reservaModel');
const mongoose = require('mongoose');

const crearReserva = async (req, res) => {
  try {
    const { id_usuario, id_material, ...horasSeleccionadas } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id_material)) {
      return res.status(400).json({ mensaje: 'ID de material no válido' });
    }

    const reservasExistentes = await Reserva.find({ id_material });

    const horasOcupadas = [];

    reservasExistentes.forEach(reserva => {
      for (const hora in horasSeleccionadas) {
        if (horasSeleccionadas[hora] && reserva[hora]) {
          horasOcupadas.push(hora);
        }
      }
    });

    if (horasOcupadas.length > 0) {
      return res.status(400).json({
        mensaje: 'Algunas horas ya están reservadas',
        horasOcupadas
      });
    }

    const nuevaReserva = new Reserva({
      id_usuario,
      id_material,
      ...horasSeleccionadas
    });

    await nuevaReserva.save();

    res.status(201).json({
      mensaje: 'Reserva creada correctamente',
      reserva: nuevaReserva
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

const obtenerReservas = async (req, res) => {
  try {
    const reservas = await Reserva.find().populate('id_usuario').populate('id_material');
    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reservas', error: error.message });
  }
};

const obtenerReservaPorId = async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id).populate('id_usuario').populate('id_material');

    if (!reserva) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    }

    res.status(200).json(reserva);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reserva', error: error.message });
  }
};

const obtenerDisponibilidadPorMaterial = async (req, res) => {
  try {
    const { id_material } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id_material)) {
      return res.status(400).json({ mensaje: 'ID de material no válido' });
    }

    const reservas = await Reserva.find({ id_material });

    const disponibilidad = {
      Hora1: true,
      Hora2: true,
      Hora3: true,
      Hora4: true,
      Hora5: true,
      Hora6: true,
      Hora7: true,
      Hora8: true,
      Hora9: true,
      Hora10: true,
      Hora11: true,
    };

    reservas.forEach(reserva => {
      for (const hora in disponibilidad) {
        if (reserva[hora]) {
          disponibilidad[hora] = false;
        }
      }
    });

    res.status(200).json(disponibilidad);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al verificar disponibilidad',
      error: error.message
    });
  }
};

// Actualizar reserva
const actualizarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario, id_material, ...horasActualizadas } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID de reserva no válido' });
    }

    // Verificar conflictos con otras reservas del mismo material
    const reservaActual = await Reserva.findById(id);
    if (!reservaActual) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    }

    const reservasExistentes = await Reserva.find({
      id_material: reservaActual.id_material,
      _id: { $ne: id }
    });

    const horasOcupadas = [];
    reservasExistentes.forEach(reserva => {
      for (const hora in horasActualizadas) {
        if (horasActualizadas[hora] && reserva[hora]) {
          horasOcupadas.push(hora);
        }
      }
    });

    if (horasOcupadas.length > 0) {
      return res.status(400).json({
        mensaje: 'Algunas horas ya están reservadas por otras reservas',
        horasOcupadas
      });
    }

    // Actualizar los campos permitidos
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      id,
      { id_usuario, id_material, ...horasActualizadas },
      { new: true }
    );

    res.status(200).json({
      mensaje: 'Reserva actualizada correctamente',
      reserva: reservaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

// Eliminar reserva
const eliminarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'ID de reserva no válido' });
    }

    const reservaEliminada = await Reserva.findByIdAndDelete(id);

    if (!reservaEliminada) {
      return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    }

    res.status(200).json({ mensaje: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

module.exports = {
  crearReserva,
  obtenerReservas,
  obtenerReservaPorId,
  obtenerDisponibilidadPorMaterial,
  actualizarReserva,
  eliminarReserva
};
