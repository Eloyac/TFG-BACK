require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().then(() => {
  console.log('Connected to Redis');
});

client.set('key', 'value')
    .then(() => client.get('key'))
    .then(value => console.log(value))
    .catch(err => console.error(err));

app.use(express.json());
app.use(cors({ origin: 'https://eloyac.github.io' }));

app.get('/', (req, res) => {
  res.send('FESACHESS Backend');
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinGame', (gameId) => {
    socket.join(gameId);
  });

  socket.on('move', (data) => {
    const { gameId, move, fen, turn, result } = data;
    socket.to(gameId).emit('move', move);
    // Optionally, save the game state to the database here
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Importar las rutas del juego
const gameRoutes = require('./routes/game');
app.use('/api/games', gameRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
