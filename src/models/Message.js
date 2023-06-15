const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: String,
    message: String,
    timestamp: Date,
});

const ChatSchema = new mongoose.Schema({
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        username: String,
      }
    ],
    messages: [MessageSchema],
});

module.exports = mongoose.model('Chat', ChatSchema);
