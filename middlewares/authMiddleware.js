const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'mi_secreto';

const validarToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ mensaje: 'Acceso denegado, token no encontrado' });

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.usuario = payload; // Guardar datos del usuario en la petición
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
};

module.exports = { validarToken };
