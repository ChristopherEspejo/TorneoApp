const mongoose = require('mongoose');

const PlayerSearchSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Mi Partido de Futbol'
  },
  position_needed: {
    type: String,
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  player_interested: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  match_date: {
    type: Date,
    required: true
  },
  match_time: {
    type: String,
    required: true
  },
  field_rental_payment: {
    type: Number,
    required: true
  },
  location: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  address: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model('PlayerSearch', PlayerSearchSchema);