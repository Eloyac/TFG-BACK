const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  boardState: {
    type: String,
    required: true,
    default: 'start',
  },
  turn: {
    type: String,
    enum: ['w', 'b'],
    default: 'w',
  },
  result: {
    type: String,
    enum: ['ongoing', 'draw', 'player1', 'player2'],
    default: 'ongoing',
  },
  moves: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model('Game', GameSchema);
