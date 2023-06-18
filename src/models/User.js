const mongoose = require('mongoose');
const Comment = require('./Comment');

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
});

module.exports = mongoose.model('User', UserSchema);
