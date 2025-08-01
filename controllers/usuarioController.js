const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'mi_secreto'; 

const registrarUsuario = async (req, res) => {
  try {
    const { nombre_usuario, matricula, contrasena, grupo, carrera } = req.body;

    // Verificar que no exista la matricula
    const existe = await Usuario.findOne({ matricula });
    if (existe) return res.status(400).json({ mensaje: 'La matrícula ya está registrada' });

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    const usuario = new Usuario({
      nombre_usuario,
      matricula,
      contrasena: contrasenaHash,
      grupo,
      carrera,
      rol: 'usuario' // por defecto
    });

    await usuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// Login usuario
const loginUsuario = async (req, res) => {
  try {
    const { matricula, contrasena } = req.body;

    const usuario = await Usuario.findOne({ matricula });
    if (!usuario) return res.status(400).json({ mensaje: 'Usuario no encontrado' });

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) return res.status(400).json({ mensaje: 'Contraseña incorrecta' });

    // Crear token JWT
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      SECRET_KEY,
      { expiresIn: '12h' }
    );

    res.json({ mensaje: 'Login exitoso', token });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// Obtener perfil (suponiendo token validado y usuario en req.usuario)
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-contrasena');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil
};
