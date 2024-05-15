const User = require('../models/User');
const mongoose = require('mongoose');



exports.profile = async (req, res) => {
  try {
    const uid = req.user.uid; // Usas el UID obtenido por tu middleware de autenticación
    const usuario = await User.findById(uid);

    if (usuario) {
      // Usuario existe
      return res.json({
        exists: true,
        user: {
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          dni: usuario.dni,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } else {
      // Usuario no existe
      return res.status(404).json({ exists: false, message: 'Usuario no encontrado.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error en el servidor');
  }
}


exports.login = async (req, res) => {
  try {
    const uid = req.user.uid; // Usas el UID obtenido por tu middleware de autenticación

    const usuario = await User.findById(uid);

    if (usuario) {
      // Usuario existe
      return res.json({
        exists: true,
        user: {
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          dni: usuario.dni,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } else {
      // Usuario no existe
      return res.status(404).json({ exists: false, message: 'Usuario no encontrado.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error en el servidor');
  }
};

exports.register = async (req, res) => {
  try {
    const { nombre, apellido, dni, email } = req.body;
    const uid = req.user.uid; // UID extraído del token de Firebase

    // Verificar si ya existe un usuario con el mismo UID
    const existingUser = await User.findById(uid);
    if (existingUser) {
      return res.status(409).json({ message: 'El usuario ya está registrado.', exist: true});
    }

    // Crear un nuevo usuario con el UID de Firebase como _id
    const newUser = new User({
      _id: uid,
      nombre,
      apellido,
      dni,
      email
      // El rol por defecto se establece en 'usuario' según la definición del modelo
    });

    // Guardar el usuario en la base de datos
    await newUser.save();

    // Respuesta exitosa
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        nombre,
        apellido,
        dni,
        email,
        rol: newUser.rol // Esto devolverá 'usuario' como valor predeterminado
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
};





