require("dotenv").config(); // Asegúrate de requerir dotenv al inicio del archivo

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

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

const uri = "mongodb+srv://eloyangulocuni:pent2001@mycluster.xhlkqax.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster";

mongoose
  .connect(uri, {
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

// Simple route
app.get("/", (req, res) => {
  res.send("FESACHESS Backend");
});

// Socket.io connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, "3c6e0b8a9c15224a8228b9a98ca1531e5a8bda3606729e8cdd14e7b5f3c69f06e8a769f6d9db4e7a5a5db3bcb07a312a3cd9e6d7d7de5f295f1a6e6a1f8a6f7a");
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
  });

  socket.on("move", (data) => {
    const { gameId, move, fen, turn, result } = data;
    socket.to(gameId).emit("move", move);
    // Optionally, save the game state to the database here
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Rutas del juego
const gameRoutes = require("./routes/game");
app.use("/api/games", gameRoutes);

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
