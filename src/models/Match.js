const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  round: {
    type: Number,
    required: true
  },
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  result: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Match', MatchSchema);
