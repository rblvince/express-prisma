const errorsHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Errori del client segnalati da express.json(): JSON malformato (400), body troppo grande (413)...
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: 'Richiesta non valida' });
  }

  console.error(err);
  res.status(500).json({ error: 'Errore interno del server' });
};

module.exports = errorsHandler;
