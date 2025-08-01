const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Configuración básica de Multer

const {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/usuarioController');

const { validarToken } = require('../middlewares/authMiddleware');

// Registrar nuevo usuario (con imágenes opcionales)
router.post('/register', upload.array('imagenes'), registrarUsuario);

// Login usuario
router.post('/login', loginUsuario);

// Obtener perfil del usuario autenticado
router.get('/perfil', validarToken, obtenerPerfil);

// Obtener todos los usuarios (protegido)
router.get('/', validarToken, obtenerUsuarios);

// Obtener usuario por ID (protegido)
router.get('/:id', validarToken, obtenerUsuarioPorId);

// Actualizar usuario por ID (con imágenes opcionales, protegido)
router.put('/:id', validarToken, upload.array('imagenes'), actualizarUsuario);

// Eliminar usuario por ID (protegido)
router.delete('/:id', validarToken, eliminarUsuario);

module.exports = router;
