const User = require('../models/User');
const Comment = require('../models/Comment');
const admin = require('firebase-admin');

exports.getUserData = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Obtener los datos del usuario
      const user = await User.findById(userId, 'name age position');
  
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      // Obtener los comentarios del usuario
      const comments = await Comment.find({ commenter: userId, rating: { $ne: null } }, 'rating');
  
      // Calcular el promedio de los ratings
      let ratingSum = 0;
      comments.forEach(comment => {
        ratingSum += comment.rating;
      });
      const ratingAverage = ratingSum / comments.length;
  
      // Devolver los datos del usuario
      res.json({
        name: user.name,
        age: user.age,
        position: user.position,
        // rating: ratingAverage,
        rating: 1,
        comments: comments
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

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

exports.sendMessage = async (req, res) => {
  const { uid } = req.user; // UID del usuario autenticado
  const { recipientId, message } = req.body; // ID del destinatario y mensaje

  try {
    // Buscar al usuario actual en la base de datos utilizando el UID
    const sender = await User.findOne({ uid });
    if (!sender) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Buscar al destinatario en la base de datos
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Destinatario no encontrado' });
    }

    // Buscar el objeto de chat correspondiente con el destinatario en el arreglo de chats del remitente
    const senderChat = sender.chats.find(chat => chat.userId.toString() === recipientId);
    if (!senderChat) {
      return res.status(404).json({ message: 'Chat no encontrado' });
    }

    // Agregar el mensaje al historial de mensajes del remitente
    senderChat.messages.push({
      sender: sender._id,
      recipient: recipient._id,
      content: message
    });

    // Buscar el objeto de chat correspondiente con el remitente en el arreglo de chats del destinatario
    const recipientChat = recipient.chats.find(chat => chat.userId.toString() === sender._id.toString());
    if (!recipientChat) {
      return res.status(404).json({ message: 'Chat no encontrado' });
    }

    // Agregar el mensaje al historial de mensajes del destinatario
    recipientChat.messages.push({
      sender: sender._id,
      recipient: recipient._id,
      content: message
    });

    // Guardar los cambios en los usuarios
    await sender.save();
    await recipient.save();

    res.json({ message: 'Mensaje enviado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getUserChats = async (req, res) => {
  const uid = req.user.uid; // UID del usuario autenticado

  try {
    // Buscar al usuario actual en la base de datos por su UID
    const user = await User.findOne({ uid }).populate('chats.userId');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener el arreglo de chats del usuario
    const chats = user.chats;

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
