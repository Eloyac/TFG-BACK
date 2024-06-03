const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const redisClient = require('../redisClient');
const auth = require('../middleware/auth');

const gameModel = new Game(redisClient);

// Crear una nueva partida
router.post('/create', auth, async (req, res) => {
  try {
    const gameId = await gameModel.createGame(req.user.id, req.body.player2Id);
    res.status(201).json({ gameId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener el estado de un juego específico
router.get('/:gameId', auth, async (req, res) => {
  try {
    const game = await gameModel.getGame(req.params.gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
