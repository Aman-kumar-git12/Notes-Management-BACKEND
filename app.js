const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();
// Import routes
const { authUserRoutes } = require("./src/auth/auth");
const { ProfileRoute } = require("./src/profile/profile");
const { NotesRoute } = require("./src/notes/notes");

// Load environment variables early
dotenv.config();

// Middlewares
app.use(express.json());

// For frontend (React) connections — optional but recommended
const cors = require("cors");
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Routes
app.use("/", authUserRoutes);
app.use("/", ProfileRoute)
app.use("/", NotesRoute);

// Start Server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});



module.exports = { app };
