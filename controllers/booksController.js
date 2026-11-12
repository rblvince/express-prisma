const prisma = require('../db/prisma');

const ID_REGEX = /^[1-9]\d{0,9}$/;
const MAX_ID = 2147483647; // limite di un Int in MySQL
const MAX_PRICE = 999999.99; // limite di DECIMAL(8,2)
const MAX_TEXT = 191; // limite di VARCHAR(191)
const MAX_DESCRIPTION_BYTES = 65535; // limite di TEXT in MySQL (in byte, non in caratteri)

// true se l'id è un intero positivo che sta in un Int di MySQL
const isValidId = (id) => ID_REGEX.test(id) && Number(id) <= MAX_ID;

// Controlla il body di store e update.
// Restituisce { error } se qualcosa non va, altrimenti { data } pronto per Prisma.
const validateBook = async (body) => {
  const { title, description, author, price, categoryId } = body ?? {};

  if (typeof title !== 'string' || !title.trim() || typeof author !== 'string' || !author.trim()) {
    return { error: 'title e author sono obbligatori' };
  }
  if (title.trim().length > MAX_TEXT || author.trim().length > MAX_TEXT) {
    return { error: `title e author possono avere al massimo ${MAX_TEXT} caratteri` };
  }
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || price > MAX_PRICE) {
    return { error: `price deve essere un numero tra 0 e ${MAX_PRICE}` };
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    return { error: 'description deve essere una stringa' };
  }
  if (typeof description === 'string' && Buffer.byteLength(description, 'utf8') > MAX_DESCRIPTION_BYTES) {
    return { error: 'description è troppo lunga' };
  }
  if (categoryId !== undefined && categoryId !== null) {
    if (!Number.isInteger(categoryId) || categoryId < 1 || categoryId > MAX_ID) {
      return { error: 'categoryId deve essere un intero positivo' };
    }
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return { error: 'categoryId non esiste' };
    }
  }

  return {
    data: {
      title: title.trim(),
      description: description ?? null,
      author: author.trim(),
      price,
      categoryId: categoryId ?? null,
    },
  };
};

// GET /books
const index = async (req, res) => {
  const books = await prisma.book.findMany({ include: { category: true }, orderBy: { id: 'asc' } });
  res.json(books);
};

// GET /books/:id
const show = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Id non valido' });
  }

  const book = await prisma.book.findUnique({ where: { id: Number(id) }, include: { category: true } });

  if (!book) {
    return res.status(404).json({ error: 'Libro non trovato' });
  }

  res.json(book);
};

// POST /books
const store = async (req, res) => {
  const { error, data } = await validateBook(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const book = await prisma.book.create({ data, include: { category: true } });

  res.status(201).json(book);
};

// PUT /books/:id: sostituisce tutti i campi del libro
const update = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Id non valido' });
  }

  const exists = await prisma.book.findUnique({ where: { id: Number(id) } });

  if (!exists) {
    return res.status(404).json({ error: 'Libro non trovato' });
  }

  const { error, data } = await validateBook(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const book = await prisma.book.update({ where: { id: Number(id) }, data, include: { category: true } });

  res.json(book);
};

// DELETE /books/:id
const destroy = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Id non valido' });
  }

  const exists = await prisma.book.findUnique({ where: { id: Number(id) } });

  if (!exists) {
    return res.status(404).json({ error: 'Libro non trovato' });
  }

  await prisma.book.delete({ where: { id: Number(id) } });

  res.sendStatus(204);
};

module.exports = { index, show, store, update, destroy };
