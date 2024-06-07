const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Middleware para verificar JWT

// Crear una nueva partida
router.post('/create', auth, async (req, res) => {
  try {
    const newGame = new Game({
      player1: req.user.id,
      boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Estado inicial del tablero
    });

    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unirse a una partida existente
router.post('/join', auth, async (req, res) => {
  const { gameId } = req.body;

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Asegurarse de que el jugador no sea el mismo que el que creó el juego
    if (game.player1.equals(req.user.id)) {
      return res.status(400).json({ message: 'You cannot join your own game' });
    }

    // Asignar el jugador 2
    game.player2 = req.user.id;
    await game.save();

    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

module.exports = router;
