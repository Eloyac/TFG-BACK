const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Crear una nueva partida
router.post('/create', auth, async (req, res) => {
  const { player2Id } = req.body; // player2Id puede ser opcional

  try {
    const newGame = new Game({
      player1: req.user.id,
      player2: player2Id || null, // Permitir que player2 sea asignado más tarde
      boardState: 'start',
    });

    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (error) {
    console.error('Error creating game:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Unirse a una partida
router.post('/join', auth, async (req, res) => {
  const { gameId } = req.body;

  try {
    let game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    if (!game.player2) {
      game.player2 = req.user.id;
      await game.save();
    }

    res.status(200).json(game);
  } catch (error) {
    console.error('Error joining game:', error.message);
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
    console.error('Error fetching game:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
