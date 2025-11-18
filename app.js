const express = require("express");
const app = express();

const dotenv = require("dotenv");
// Import routes
const { authUserRoutes } = require("./src/auth/auth");
const { ProfileRoute } = require("./src/profile/profile");
const { NotesRoute } = require("./src/notes/notes");
const { FavouritesRoute } = require("./src/favourites/favourites");

// Load environment variables early
dotenv.config();

// Middlewares
app.use(express.json());

// For frontend (React) connections — optional but recommended
const cors = require("cors");
app.use(cors({
  origin: "http://localhost:5173", // frontend origin (no trailing slash)
  credentials: true,
}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Routes
app.use("/", authUserRoutes);
app.use("/", ProfileRoute)
app.use("/", NotesRoute);
app.use("/", FavouritesRoute);

// Start Server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global error handlers to surface problems
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

module.exports = { app };
