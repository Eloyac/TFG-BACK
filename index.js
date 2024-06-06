const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(cors({ origin: "https://eloyac.github.io" }));

// Set Permissions-Policy header
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "interest-cohort=()");
  next();
});

const uri =
  "mongodb+srv://eloyangulocuni:pent2001@mycluster.xhlkqax.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster";
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

// Simple route
app.get("/", (req, res) => {
  res.send("FESACHESS Backend");
});

// Rutas del juego
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinGame", (gameId) => {
    socket.join(gameId);
  });

  socket.on("move", (data) => {
    const { gameId, move, fen, turn, result } = data;
    socket.to(gameId).emit("move", move);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
