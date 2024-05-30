const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Middleware para verificar JWT

// Crear una nueva partida
router.post('/create', auth, async (req, res) => {
  const { player2Id } = req.body;

  try {
    const newGame = new Game({
      player1: req.user.id,
      player2: player2Id,
      boardState: 'start', // Estado inicial del tablero
    });

    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener partidas para un usuario
router.get('/mygames', auth, async (req, res) => {
  try {
    const games = await Game.find({ $or: [{ player1: req.user.id }, { player2: req.user.id }] });
    res.json(games);
  } catch (error) {
    res.status (500).json({ message: error.message });
  }
});

// Obtener el estado de un juego específico
router.get('/:gameId', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const adjustRatings = (winner, loser) => {
  const k = 32;
  const winnerRating = winner.rating;
  const loserRating = loser.rating;

  const expectedScoreWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedScoreLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  winner.rating += k * (1 - expectedScoreWinner);
  loser.rating += k * (0 - expectedScoreLoser);

  return [winner, loser];
};

router.post('/move', auth, async (req, res) => {
  const { gameId, move, fen, turn, result } = req.body;

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    game.moves.push(move);
    game.boardState = fen;
    game.turn = turn;
    game.result = result;

    if (result !== 'ongoing') {
      const player1 = await User.findById(game.player1);
      const player2 = await User.findById(game.player2);

      if (result === 'player1') {
        [player1, player2] = adjustRatings(player1, player2);
      } else if (result === 'player2') {
        [player2, player1] = adjustRatings(player2, player1);
      }

      await player1.save();
      await player2.save();
    }

    await game.save();
    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
