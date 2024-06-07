const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const Game = require('./models/Game');

// Configuraciones hardcodeadas
const MONGO_URI =
  "mongodb+srv://eloyangulocuni:pent2001@mycluster.xhlkqax.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster";
const JWT_SECRET =
  "3c6e0b8a9c15224a8228b9a98ca1531e5a8bda3606729e8cdd14e7b5f3c69f06e8a769f6d9db4e7a5a5db3bcb07a312a3cd9e6d7d7de5f295f1a6e6a1f8a6f7a";

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://eloyac.github.io",
    methods: ["GET", "POST"],
    allowedHeaders: ["x-auth-token"],
    credentials: true,
  },
});

// Conectar a MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

// Middleware
app.use(express.json());
app.use(cors({ origin: "https://eloyac.github.io", credentials: true }));

// Rutas
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);

// Socket.io authentication
// Autenticación con socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded.user;
    next();
  } catch (err) {
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinGame", (gameId) => {
    socket.join(gameId);
    console.log(`Socket joined game: ${gameId}`);
  });

  socket.on("move", async (data) => {
    const { gameId, move, fen, turn, result } = data;

    try {
      let game = await Game.findById(gameId);
      if (!game) {
        return console.error("Game not found");
      }

      // Asegúrate de que el turno coincide con el color del jugador
      const playerColor = game.turn === 'w' ? 'player1' : 'player2';
      const userId = socket.user.id;

      if (game[playerColor] !== userId) {
        return console.error("Not your turn");
      }

      game.moves.push(JSON.stringify(move));
      game.boardState = fen;
      game.turn = turn;
      game.result = result;
      await game.save();

      io.to(gameId).emit("move", { move: JSON.stringify(move), fen, turn, result });
    } catch (error) {
      console.error("Error processing move:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});





const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
