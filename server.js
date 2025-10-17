// server.js
require('dotenv').config();
const sql = require('mssql');
const express = require('express');
const path = require('path');

const productsRouter = require('./api/products');
const ApiError = require('./errors/errorResponse');

const app = express();
const PORT = process.env.PORT || 3000;

// Якщо не використовуємо MSSQL — пропускаємо підключення
if (process.env.USE_INMEMORY === 'false') {
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
      encrypt: false,
      trustServerCertificate: true
    },
    port: parseInt(process.env.DB_PORT || '1433')
  };

  sql.connect(config)
    .then(() => console.log('Connected to MSSQL'))
    .catch(err => console.error('DB connection error:', err));
} else {
  console.log('Using in-memory database (no MSSQL connection)');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/products', productsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.isApiError) {
    res.status(err.status).json(err.toResponse());
  } else {
    res.status(500).json({ error: 'InternalServerError', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
