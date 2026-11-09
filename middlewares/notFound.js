const notFound = (req, res) => {
  res.status(404).json({ error: 'Rotta non trovata' });
};

module.exports = notFound;
