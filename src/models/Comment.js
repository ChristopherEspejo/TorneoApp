const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  comment: { type: String },
  commenter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number },
});

module.exports = mongoose.model('Comment', CommentSchema);
