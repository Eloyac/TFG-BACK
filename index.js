const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error(err.message);
});

// Middleware
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

// Simple route
app.get('/', (req, res) => {
  res.send('FESACHESS Backend');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinGame', (gameId) => {
    socket.join(gameId);
  });

  socket.on('leaveGame', (gameId) => {
    socket.leave(gameId);
  });

  socket.on('sendMessage', ({ gameId, text }) => {
    const message = { text };
    io.to(gameId).emit('message', message);
  });

  socket.on('move', (move) => {
    io.emit('move', move); // Emitir el movimiento a todos los clientes
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
