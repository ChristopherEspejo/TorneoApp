const Comment = require('../models/Comment');
const User = require('../models/User');

exports.createComment = async (req, res) => {
    try {
      const { userId } = req.params;
      const { comment, rating } = req.body;
      const { _id } = req.user;
  
      // Verificar si el usuario está intentando comentarse a sí mismo
      if (userId === _id) {
        return res.status(400).json({ message: 'No puedes comentarte a ti mismo' });
      }
  
      // Buscar el usuario al que se le realizará el comentario
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      // Crear el nuevo comentario
      const newComment = new Comment({
        comment,
        commenter: _id,
        rating,
      });
  
      // Guardar el comentario en la base de datos
      const savedComment = await newComment.save();
  
      // Agregar el comentario al usuario
      user.comments.push(savedComment._id);
      await user.save();
  
      res.json(savedComment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  