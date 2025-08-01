const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialesController');
const { uploadDisk } = require('../config/multerConfig');

// Crear material (con imágenes)
router.post('/', uploadDisk.any(), materialController.crearMaterial);

// Otras rutas
router.get('/', materialController.obtenerMateriales);
router.get('/:id', materialController.obtenerMaterialPorId);
router.put('/:id', uploadDisk.any(), materialController.actualizarMaterial);
router.delete('/:id', materialController.eliminarMaterial);

module.exports = router;
