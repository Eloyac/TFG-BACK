const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  boardState: {
    type: String,
    required: true,
  },
  moves: {
    type: Array,
    default: [],
  },
  turn: {
    type: String,
    default: 'white',
  },
  result: {
    type: String,
    default: 'ongoing',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('game', GameSchema);
