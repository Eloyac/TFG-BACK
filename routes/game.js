const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const auth = require('../middleware/auth');

// Crear una nueva partida
router.post('/create', auth, async (req, res) => {
  const { player2Id } = req.body;

  try {
    const newGame = new Game({
      player1: req.user.id,
      player2: player2Id || null,
      boardState: 'start', // Estado inicial del tablero
    });

    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (error) {
    console.error('Error creating game:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Obtener partidas para un usuario
router.get('/mygames', auth, async (req, res) => {
  try {
    const games = await Game.find({ $or: [{ player1: req.user.id }, { player2: req.user.id }] });
    res.json(games);
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
