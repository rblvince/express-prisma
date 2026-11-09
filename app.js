require('dotenv/config');
const express = require('express');
const booksRouter = require('./routers/books');
const notFound = require('./middlewares/notFound');
const errorsHandler = require('./middlewares/errorsHandler');

const app = express();
app.disable('x-powered-by'); // non dire a tutti che gira Express
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server della libreria');
});

app.use('/books', booksRouter);

app.use(notFound);
app.use(errorsHandler);

// 127.0.0.1: il server risponde solo da questo computer, non dalla rete
app.listen(port, '127.0.0.1', () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});
