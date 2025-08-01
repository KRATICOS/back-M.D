const express = require('express');
const router = express.Router();

const reservaController = require('../controllers/reservaController');

// Crear reserva
router.post('/', reservaController.crearReserva);

// Obtener todas las reservas
router.get('/', reservaController.obtenerReservas);

// Obtener reserva por ID
router.get('/:id', reservaController.obtenerReservaPorId);

// Obtener disponibilidad por material (por ejemplo, /disponibilidad/:id_material)
router.get('/disponibilidad/:id_material', reservaController.obtenerDisponibilidadPorMaterial);

// Actualizar reserva por ID
router.put('/:id', reservaController.actualizarReserva);

// Eliminar reserva por ID
router.delete('/:id', reservaController.eliminarReserva);

module.exports = router;
