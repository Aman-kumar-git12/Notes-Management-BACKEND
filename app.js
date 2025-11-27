const express = require("express");
const app = express();
app.set("trust proxy", 1); // Trust first proxy (required for secure cookies on Render/Heroku/etc)

const dotenv = require("dotenv");
dotenv.config();

// Import routes
const { authUserRoutes } = require("./src/auth/auth");
const { ProfileRoute } = require("./src/profile/profile");
const { NotesRoute } = require("./src/notes/notes");

// Middlewares
app.use(express.json());

// For frontend (React) connections — optional but recommended
const cors = require("cors");

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Fallback for local dev
  credentials: true,
}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Routes
app.use("/", authUserRoutes);
app.use("/", ProfileRoute)
app.use("/", NotesRoute);

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app };
