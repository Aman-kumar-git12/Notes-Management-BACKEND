const express = require("express");
const { prisma } = require("../../prisma/prismaClient");
const authUserRoutes = express.Router();
const { ValidationSignupData } = require("../middleware/validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");




authUserRoutes.post("/signup", async (req, res) => {
  try {
    // Validate data
    try {
      ValidationSignupData(req);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: passwordHash },
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Set secure cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Remove password before sending
    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      message: "User created successfully",
      user: safeUser,
    });

  } catch (err) {

    return res.status(500).json({ message: "Internal server error", err });
  }
});



authUserRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('ok')

    // Check user existence
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Set cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { password: _, ...safeUser } = user;

    return res.json({
      message: "Login successful",
      user: safeUser,
    });

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Internal server error", err });
  }
});



authUserRoutes.post("/logout", (req, res) => {
  res.clearCookie("auth_token");
  return res.json({ message: "Logout successful" });
});


authUserRoutes.get("/me", async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password, ...safeUser } = user;

    res.json({ user: safeUser });
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error });
  }
});


module.exports = { authUserRoutes };
