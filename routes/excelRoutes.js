const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const fs = require('fs');
const bcrypt = require('bcryptjs'); // para hashear contraseñas
const { uploadDisk } = require('../config/multerConfig');
const Usuario = require('../models/usuario'); // Tu modelo de usuario

router.post('/excel', uploadDisk.single('archivo'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const registros = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // omitir encabezado

      const [nombre_usuario, matricula, grupo, carrera] = row.values.slice(1); // eliminar celda vacía al inicio

      // Validar datos mínimos
      if (!nombre_usuario || !matricula || !grupo || !carrera) return;

      registros.push({
        nombre_usuario: String(nombre_usuario).trim(),
        matricula: String(matricula).trim(),
        contrasena: bcrypt.hashSync('12345678', 10), // contraseña por defecto hasheada
        grupo: String(grupo).trim(),
        carrera: String(carrera).trim(),
        rol: 'usuario', // rol por defecto
        imagenes: []    // campo no obligatorio
      });
    });

    // Evitar duplicados por matrícula (validar contra la BD)
    const matriculasExistentes = await Usuario.find({
      matricula: { $in: registros.map(r => r.matricula) }
    }).select('matricula');

    const matriculasYaRegistradas = matriculasExistentes.map(u => u.matricula);

    const nuevosRegistros = registros.filter(
      r => !matriculasYaRegistradas.includes(r.matricula)
    );

    await Usuario.insertMany(nuevosRegistros);

    // Eliminar el archivo después de procesarlo
    fs.unlinkSync(filePath);

    res.status(200).json({
      mensaje: 'Usuarios registrados correctamente',
      totalExcel: registros.length,
      insertados: nuevosRegistros.length,
      omitidosPorDuplicado: matriculasYaRegistradas.length,
      duplicados: matriculasYaRegistradas
    });
  } catch (error) {
    console.error('Error al registrar usuarios en masa:', error);
    res.status(500).json({ mensaje: 'Error al registrar usuarios desde Excel' });
  }
});

module.exports = router;
