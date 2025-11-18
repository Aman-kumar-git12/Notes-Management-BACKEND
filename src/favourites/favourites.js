const express = require('express');
const { prisma } = require('../../prisma/prismaClient');
const jwt = require('jsonwebtoken');
const FavouritesRoute = express.Router();

// GET /favourites  - list favourites for current user
FavouritesRoute.get('/favourites', async (req, res) => {
  try {
    const token = req.cookies?.auth_token;
    const where = {};
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      where.userId = decoded.userId;
    }
    const favs = await prisma.favourite.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(favs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching favourites', error: err.message });
  }
});

// POST /favourites  - create favourite using body (bookId, title, author, url)
FavouritesRoute.post('/favourites', async (req, res) => {
  try {
    const body = req.body || {};
    const data = {
      bookId: body.bookId,
      title: body.title,
      author: body.author,
      url: body.url,
    };
    const token = req.cookies?.auth_token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      data.userId = decoded.userId;
    }
  if (!data.userId) return res.status(400).json({ message: 'userId is required' });
  const fav = await prisma.favourite.create({ data });
    res.status(201).json(fav);
  } catch (err) {
    res.status(400).json({ message: 'Error creating favourite', error: err.message });
  }
});

// POST /:bookId/favourite  - older frontend pattern (book-specific route)
FavouritesRoute.post('/:bookId/favourite', async (req, res) => {
  try {
    const { bookId } = req.params;
    const body = req.body || {};
    const data = {
      bookId: body.bookId || bookId,
      title: body.title,
      author: body.author,
      url: body.url,
    };
    const token = req.cookies?.auth_token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      data.userId = decoded.userId;
    }
  if (!data.userId) return res.status(400).json({ message: 'userId is required' });
  const fav = await prisma.favourite.create({ data });
    res.status(201).json(fav);
  } catch (err) {
    res.status(400).json({ message: 'Error creating favourite', error: err.message });
  }
});

// DELETE /favourites/:id
FavouritesRoute.delete('/favourites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.cookies?.auth_token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const existing = await prisma.favourite.findUnique({ where: { id } });
      if (!existing || existing.userId !== decoded.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    await prisma.favourite.delete({ where: { id } });
    res.json({ message: 'Favourite removed' });
  } catch (err) {
    res.status(400).json({ message: 'Error removing favourite', error: err.message });
  }
});

module.exports = { FavouritesRoute };
