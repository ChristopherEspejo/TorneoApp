const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  teams: [{
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    state: {
      type: String,
      default: 'pendiente'
    },
    voucher: {
      type: String
    }
  }],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rounds: {
    type: Number,
    default: 0
  },
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  roundMatches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  winners: [{
    _id: false,
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }
  }],
  isRoundComplete: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  inscription: {
    type: Number,
    required: true
  },
  prize: {
    type: Number,
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  teamCount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Tournament', TournamentSchema);
