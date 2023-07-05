const mongoose = require('mongoose');
const Comment = require('./Comment');

const ChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID del usuario con el que se chatea
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID del remitente del mensaje
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID del receptor del mensaje
    content: { type: String } // Contenido del mensaje
  }]
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  uid: { type: String, required: true, unique: true },
  role: { type: String, required: true, default: 'user' },
  age: { type: Number, required: true },
  position: { type: String, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  location: {
    latitude: { type: Number, default: -12.046374 },
    longitude: { type: Number, default: -77.042793 },
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  chats: [ChatSchema], // Arreglo de objetos de chat
});
module.exports = mongoose.model('User', UserSchema);
