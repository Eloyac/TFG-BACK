const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const auth = require('../middleware/auth'); 

router.post('/create', auth, async (req, res) => {
  try {
    const newGame = new Game({
      player1: req.user.id,
      boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    });

    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/join', auth, async (req, res) => {
  const { gameId } = req.body;

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    if (game.player1.equals(req.user.id)) {
      return res.status(400).json({ message: 'You cannot join your own game' });
    }
    game.player2 = req.user.id;
    await game.save();

    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


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
