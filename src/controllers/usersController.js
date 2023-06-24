const User = require('../models/User');

const admin = require('firebase-admin');

exports.createUser = async (req, res) => {
    const { name, username, email, role, age, position, location } = req.body;
  
    try {
      // El UID del usuario se extrae de los datos del token que están en req.user.uid
      const uid = req.user.uid;
  
      // Verificar si ya existe un usuario con el mismo nombre de usuario o email
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario o email ya está en uso' });
      }
  
      const user = new User({
        name,
        username,
        email,
        role,
        age,
        position,
        location,
        uid // Guardar el UID del usuario de Firebase en el campo 'uid'
      });
  
      const newUser = await user.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  




exports.getUser = async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.id });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.updateUser = async (req, res) => {
    // Asegurarse de que no estamos actualizando el equipo directamente
    if (req.body.team !== undefined) {
        return res.status(400).json({ message: 'No se puede actualizar el equipo directamente.' });
    }
    
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
