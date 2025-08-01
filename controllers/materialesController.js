const Material = require('../models/materialesModel');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://gmflswlxghleuauuieis.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtZmxzd2x4Z2hsZXVhdXVpZWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTQxMzgsImV4cCI6MjA2ODI5MDEzOH0.HCijwySIzbDa0-iNO_-mMSZp-ZMpKVE35YIDdnT_fdA';

const supabase = createClient(supabaseUrl, supabaseKey);



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
    console.error('❌ Error al subir archivo a Supabase:', error);
    return null;
  }

  return data;
}



const crearMaterial = async (req, res) => {
  try {
    const { nombre, categoria, estado, codigoserie, descripcion } = req.body;
    const files = req.files;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron imágenes' });
    }


    const existe = await Material.findOne({ codigoserie });
    if (existe) {
      return res.status(400).json({ mensaje: 'El Material ya está registrado' });
    }

    const imagenes = [];
    for (const file of files) {
      const resultupload = await uploadToSupabase(file);
      if (resultupload?.path) {
        imagenes.push({ url: resultupload.path });
      }
    }

    const material = new Material({
      nombre,
      categoria,
      estado,
      imagenes,
      codigoserie,
      descripcion,
    });

    await material.save();

    res.status(201).json({ mensaje: 'Material creado correctamente', material });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const obtenerMateriales = async (req, res) => {
  try {
    const materiales = await Material.find();
    res.json(materiales);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const obtenerMaterialPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ mensaje: 'Material no encontrado' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const actualizarMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, estado, codigoserie, descripcion } = req.body;
    const files = req.files;

    const materialExistente = await Material.findById(id);
    if (!materialExistente) {
      return res.status(404).json({ mensaje: 'Material no encontrado' });
    }

    if (codigoserie && codigoserie !== materialExistente.codigoserie) {
      const existe = await Material.findOne({ codigoserie, _id: { $ne: id } });
      if (existe) {
        return res.status(400).json({ mensaje: 'El código de serie ya está registrado en otro material' });
      }
    }

    const nuevasImagenes = [];

    if (files && Array.isArray(files)) {
      for (const file of files) {
        const resultupload = await uploadToSupabase(file);
        if (resultupload?.path) {
          nuevasImagenes.push({ url: resultupload.path });
        }
      }
    }

    materialExistente.nombre = nombre || materialExistente.nombre;
    materialExistente.categoria = categoria || materialExistente.categoria;
    materialExistente.estado = estado || materialExistente.estado;
    materialExistente.codigoserie = codigoserie || materialExistente.codigoserie;
    materialExistente.descripcion = descripcion || materialExistente.descripcion;

    if (nuevasImagenes.length > 0) {
      materialExistente.imagenes = materialExistente.imagenes.concat(nuevasImagenes);
    }

    await materialExistente.save();

    res.json({ mensaje: 'Material actualizado correctamente', material: materialExistente });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const eliminarMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByIdAndDelete(id);
    if (!material) {
      return res.status(404).json({ mensaje: 'Material no encontrado' });
    }


    res.json({ mensaje: 'Material eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};


module.exports = {
  crearMaterial,
  obtenerMateriales,
  obtenerMaterialPorId,
  actualizarMaterial,
  eliminarMaterial
};
