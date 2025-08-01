
// const express = require('express');
// const mongoose = require('mongoose');


// require('dotenv').config();

// const Usuario = require('./models/usuarioModel');
// const usuarioRoutes = require('./routes/usuarioRoutes'); // <-- Añadido aquí
// const materialRoutes = require('./routes/materialesRoutes');


// const app = express();
// const DB_URL = process.env.DB_URL;
// const PORT = process.env.PORT || 3000;

// // Middleware para procesar JSON
// app.use(express.json());

// // Montar rutas de usuario
// app.use('/api/usuarios', usuarioRoutes); // <-- Añadido aquí


// app.use('/api/materiales', materialRoutes);


// // Crear superadministrador por defecto
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const crearSuperAdmin = async () => {
//   const existe = await Usuario.findOne({ rol: 'superadministrador' });

//   if (!existe) {
//     // Hashear la contraseña
//     const hashedPassword = await bcrypt.hash('contraseñaSegura', 10);

//     const superAdmin = new Usuario({
//       nombre_usuario: 'Super Admin',
//       matricula: '000000',
//       contrasena: hashedPassword,
//       grupo: 'N/A',
//       carrera: 'N/A',
//       rol: 'superadministrador'
//     });

//     await superAdmin.save();

//     // Generar token
//     const token = jwt.sign(
//       { id: superAdmin._id, rol: superAdmin.rol },
//       process.env.JWT_SECRET || 'secreto123',
//       { expiresIn: '7d' }
//     );

//     console.log('✅ Superadministrador creado por defecto');
//     console.log('🔐 Token JWT del superadmin:', token);
//   }
// };


// // Conexión a MongoDB
// if (!DB_URL) {
//   console.error('❌ No se ha definido DB_URL en las variables de entorno.');
//   process.exit(1);
// }

// mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log('✅ Conectado a MongoDB');
//     crearSuperAdmin();
//   })
//   .catch(error => console.error('❌ Error de conexión a MongoDB:', error));

// // Iniciar servidor
// app.listen(PORT, () => {
//   console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
// });



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Usuario = require('./models/usuarioModel');
const usuarioRoutes = require('./routes/usuarioRoutes');
const materialRoutes = require('./routes/materialesRoutes');
const reservaRoutes = require('./routes/reservaRoutes');



const app = express();
const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Para solicitudes JSON
app.use(express.urlencoded({ extended: true })); // Para formularios HTML



// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/materiales', materialRoutes);
app.use('/api/reservas', reservaRoutes);


// Crear superadministrador por defecto
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const crearSuperAdmin = async () => {
  try {
    const existe = await Usuario.findOne({ rol: 'superadministrador' });

    if (!existe) {
      const hashedPassword = await bcrypt.hash('contraseñaSegura', 10);

      const superAdmin = new Usuario({
        nombre_usuario: 'Super Admin',
        matricula: '000000',
        contrasena: hashedPassword,
        grupo: 'N/A',
        carrera: 'N/A',
        rol: 'superadministrador'
      });

      await superAdmin.save();

      const token = jwt.sign(
        { id: superAdmin._id, rol: superAdmin.rol },
        process.env.JWT_SECRET || 'secreto123',
        { expiresIn: '7d' }
      );

      console.log('✅ Superadministrador creado por defecto');
      console.log('🔐 Token JWT del superadmin:', token);
    }
  } catch (error) {
    console.error('❌ Error creando el superadmin:', error);
  }
};

// Conectar a MongoDB
if (!DB_URL) {
  console.error('❌ Falta la variable de entorno DB_URL');
  process.exit(1);
}

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    crearSuperAdmin();
  })
  .catch(error => console.error('❌ Error de conexión a MongoDB:', error));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
