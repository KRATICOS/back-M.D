const express = require('express');
const router = express.Router();

const {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil
} = require('../controllers/usuarioController');

const { validarToken } = require('../middlewares/authMiddleware'); // Middleware para proteger rutas

// Registrar nuevo usuario
router.post('/register', registrarUsuario);

// Login usuario
router.post('/login', loginUsuario);

// Ruta protegida: obtener perfil (requiere token)
router.get('/perfil', validarToken, obtenerPerfil);

module.exports = router;
