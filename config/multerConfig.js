// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');



// const memoryStorage = multer.memoryStorage();
// const uploadMemory = multer({ storage: memoryStorage });

// const uploadDir = path.join(__dirname, '../uploads');

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// const diskStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const uploadDisk = multer({ storage: diskStorage });

// module.exports = {
//   uploadMemory,
//   uploadDisk,
// };


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 📁 Ruta del directorio de uploads
const uploadDir = path.join(__dirname, '../uploads');

// 🛠️ Crear el directorio si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 📦 Almacenamiento en memoria (RAM)
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

// 💾 Almacenamiento en disco con nombre único
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // usa carpeta uploads/
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const uploadDisk = multer({ storage: diskStorage });

// ✅ Exportar ambos tipos de almacenamiento
module.exports = {
  uploadMemory,
  uploadDisk
};
