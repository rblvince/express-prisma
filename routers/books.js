const express = require('express');
const prisma = require('../db/prisma');

const router = express.Router();

const ID_REGEX = /^[1-9]\d{0,9}$/;
const MAX_ID = 2147483647; // limite di un Int in MySQL
const MAX_PRICE = 999999.99; // limite di DECIMAL(8,2)
const MAX_TEXT = 191; // limite di VARCHAR(191)
const MAX_DESCRIPTION_BYTES = 65535; // limite di TEXT in MySQL (in byte, non in caratteri)

// true se l'id è un intero positivo che sta in un Int di MySQL
const isValidId = (id) => ID_REGEX.test(id) && Number(id) <= MAX_ID;

// Index
router.get('/', async (req, res) => {
  const books = await prisma.book.findMany({ include: { category: true }, orderBy: { id: 'asc' } });
  res.json(books);
});

// Show
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Id non valido' });
  }

  const book = await prisma.book.findUnique({ where: { id: Number(id) }, include: { category: true } });

  if (!book) {
    return res.status(404).json({ error: 'Libro non trovato' });
  }

  res.json(book);
});

// Store
router.post('/', async (req, res) => {
  const { title, description, author, price, categoryId } = req.body ?? {};

  if (typeof title !== 'string' || !title.trim() || typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({ error: 'title e author sono obbligatori' });
  }
  if (title.trim().length > MAX_TEXT || author.trim().length > MAX_TEXT) {
    return res.status(400).json({ error: `title e author possono avere al massimo ${MAX_TEXT} caratteri` });
  }
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || price > MAX_PRICE) {
    return res.status(400).json({ error: `price deve essere un numero tra 0 e ${MAX_PRICE}` });
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    return res.status(400).json({ error: 'description deve essere una stringa' });
  }
  if (typeof description === 'string' && Buffer.byteLength(description, 'utf8') > MAX_DESCRIPTION_BYTES) {
    return res.status(400).json({ error: 'description è troppo lunga' });
  }
  if (categoryId !== undefined && categoryId !== null) {
    if (!Number.isInteger(categoryId) || categoryId < 1 || categoryId > MAX_ID) {
      return res.status(400).json({ error: 'categoryId deve essere un intero positivo' });
    }
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(400).json({ error: 'categoryId non esiste' });
    }
  }

  const book = await prisma.book.create({
    data: { title: title.trim(), description, author: author.trim(), price, categoryId },
    include: { category: true },
  });

  res.status(201).json(book);
});

// Update (segnaposto)
router.put('/:id', (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Id non valido' });
  res.json({ message: 'Modifica totale del libro', id: Number(req.params.id) });
});

// Modify (segnaposto)
router.patch('/:id', (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Id non valido' });
  res.json({ message: 'Modifica parziale del libro', id: Number(req.params.id) });
});

// Destroy (segnaposto)
router.delete('/:id', (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Id non valido' });
  res.json({ message: 'Eliminazione del libro', id: Number(req.params.id) });
});

module.exports = router;
