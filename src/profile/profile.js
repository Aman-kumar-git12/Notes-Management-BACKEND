
const express = require("express");
const { prisma } = require("../../prisma/prismaClient");
const jwt = require("jsonwebtoken");
const ProfileRoute = express.Router();




ProfileRoute.get("/profile", async (req, res) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const { userId } = decoded;

    // find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // remove password
    const { password, ...safeUser } = user;

    return res.json({
      message: "Profile fetched successfully",
      user: safeUser
    });

  } catch (err) {
    return res.status(401).json({
      message: "Error fetching profile",
      error: err.message
    });
  }
});

    

module.exports = { ProfileRoute };