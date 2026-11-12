const express = require('express');
const booksController = require('../controllers/booksController');

const router = express.Router();

// Il router dice solo quale funzione risponde a quale rotta: la logica sta nel controller
router.get('/', booksController.index);
router.get('/:id', booksController.show);
router.post('/', booksController.store);
router.put('/:id', booksController.update);
router.delete('/:id', booksController.destroy);

module.exports = router;
