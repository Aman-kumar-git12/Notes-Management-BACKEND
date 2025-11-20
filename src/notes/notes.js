const express = require('express');
const { prisma } = require('../../prisma/prismaClient');
const jwt = require('jsonwebtoken');
const NotesRoute = express.Router();



// GET /notes
NotesRoute.get('/notes', async (req, res) => {
  try {
    const token = req.cookies?.auth_token;
    let where = {};
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      where.userId = decoded.userId;
    }
    const notes = await prisma.note.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notes', error: err.message });
  }
});


NotesRoute.post("/notes", async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // 1️⃣ Read token from cookie
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID missing in token" });
    }

    // 3️⃣ Create the note
    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId, // automatically connects logged-in user
      },
    });


    return res.status(201).json(note);
  } catch (err) {


    return res.status(400).json({
      message: "Error creating note",
      error: err.message,
    });
  }
});



NotesRoute.get("/notes/:id", async (req, res) => {
  try {
    const id = req.params.id;


    // Must be authenticated
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }


    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Fetch note
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Prevent accessing other user's note
    if (note.userId !== decoded.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(note);
  } catch (err) {

    res.status(500).json({ message: "Error fetching note", error: err.message });
  }
});



NotesRoute.put("/notes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const changes = req.body;

    // Token validation
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Decode user
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Find note
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if user owns the note
    if (existing.userId !== decoded.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Update note
    const updated = await prisma.note.update({
      where: { id },
      data: changes,
    });

    return res.json(updated);
  } catch (err) {
    res.status(400).json({
      message: "Error updating note",
      error: err.message,
    });
  }
});



NotesRoute.delete("/notes/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (existing.userId !== decoded.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.note.delete({ where: { id } });
    res.json({ message: "Note deleted successfully" });

  } catch (err) {
    res.status(400).json({
      message: "Error deleting note",
      error: err.message,
    });
  }
});


module.exports = { NotesRoute };
