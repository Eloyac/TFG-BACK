const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  boardState: {
    type: String,
    default: 'start'
  },
  moves: {
    type: [String],
    default: []
  },
  result: {
    type: String,
    default: 'ongoing'
  },
  turn: {
    type: String,
    default: 'w'
  }
});

module.exports = mongoose.model('Game', GameSchema);
