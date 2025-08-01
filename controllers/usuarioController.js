const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SECRET_KEY = process.env.JWT_SECRET || 'mi_secreto';

const supabase = createClient(
  'https://gmflswlxghleuauuieis.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtZmxzd2x4Z2hsZXVhdXVpZWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTQxMzgsImV4cCI6MjA2ODI5MDEzOH0.HCijwySIzbDa0-iNO_-mMSZp-ZMpKVE35YIDdnT_fdA'
);

function normalizeFileName(filename) {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w.-]/g, '_');
}

async function uploadToSupabase(file) {
  const fileBuffer = fs.readFileSync(file.path);
  const safeFileName = normalizeFileName(file.originalname);

  const { data, error } = await supabase.storage
    .from('inventario')
    .upload(`public/${safeFileName}`, fileBuffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    console.error(' Error al subir imagen a Supabase:', error);
    return null;
  }

  return data;
}

const registrarUsuario = async (req, res) => {
  try {
    const { nombre_usuario, matricula, contrasena, grupo, carrera } = req.body;
    const files = req.files;

    const existe = await Usuario.findOne({ matricula });
    if (existe) return res.status(400).json({ mensaje: 'La matrícula ya está registrada' });

    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    const imagenes = [];
    if (files && Array.isArray(files)) {
      for (const file of files) {
        const result = await uploadToSupabase(file);
        if (result?.path) {
          imagenes.push({ url: result.path });
        }
      }
    }

    const usuario = new Usuario({
      nombre_usuario,
      matricula,
      contrasena: contrasenaHash,
      grupo,
      carrera,
      rol: 'usuario',
      imagenes
    });

    await usuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { matricula, contrasena } = req.body;

    const usuario = await Usuario.findOne({ matricula });
    if (!usuario) return res.status(400).json({ mensaje: 'Usuario no encontrado' });

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) return res.status(400).json({ mensaje: 'Contraseña incorrecta' });

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

const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-contrasena');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contrasena');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).select('-contrasena');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_usuario, matricula, grupo, carrera, rol } = req.body;
    const files = req.files;

    const usuarioExistente = await Usuario.findById(id);
    if (!usuarioExistente) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    if (matricula && matricula !== usuarioExistente.matricula) {
      const existe = await Usuario.findOne({ matricula, _id: { $ne: id } });
      if (existe) return res.status(400).json({ mensaje: 'La matrícula ya está registrada por otro usuario' });
    }

    const nuevasImagenes = [];
    if (files && Array.isArray(files)) {
      for (const file of files) {
        const result = await uploadToSupabase(file);
        if (result?.path) {
          nuevasImagenes.push({ url: result.path });
        }
      }
    }

    usuarioExistente.nombre_usuario = nombre_usuario || usuarioExistente.nombre_usuario;
    usuarioExistente.matricula = matricula || usuarioExistente.matricula;
    usuarioExistente.grupo = grupo || usuarioExistente.grupo;
    usuarioExistente.carrera = carrera || usuarioExistente.carrera;
    usuarioExistente.rol = rol || usuarioExistente.rol;

    if (nuevasImagenes.length > 0) {
      usuarioExistente.imagenes = usuarioExistente.imagenes.concat(nuevasImagenes);
    }

    await usuarioExistente.save();
    res.json({ mensaje: 'Usuario actualizado correctamente', usuario: usuarioExistente });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByIdAndDelete(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
};
