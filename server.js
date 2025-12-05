require('dotenv').config();
const sql = require('mssql');
const express = require('express');
const path = require('path');
const crypto = require('crypto');

const productsRouter = require('./api/products');

const app = express();
const PORT = process.env.PORT || 3000;

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

  console.log('DB CONFIG:', config);

  sql.connect(config)
    .then(() => console.log('Connected to MSSQL'))
    .catch(err => console.error('DB connection error:', err));
} else {
  console.log('Using in-memory database (no MSSQL connection)');
}

app.use((req, res, next) => {
  const rid = req.get('X-Request-Id') || crypto.randomUUID();
  req.rid = rid;
  res.setHeader('X-Request-Id', rid);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const rate = new Map();
const WINDOW_MS = 10000; 
const MAX_REQ = 200;

const now = () => Date.now();

app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local';
  const b = rate.get(ip) ?? { count: 0, ts: now() };
  const within = now() - b.ts < WINDOW_MS;
  const state = within ? { count: b.count + 1, ts: b.ts } : { count: 1, ts: now() };
  rate.set(ip, state);

  if (state.count > MAX_REQ) {
    res.setHeader('Retry-After', '2'); 
    return res.status(429).json({ error: 'too_many_requests', requestId: req.rid });
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/products', productsRouter);

app.use((err, req, res, next) => {
  console.error('Error:', err);

  const rid = req.rid || crypto.randomUUID();

  if (err.isApiError) {
    return res.status(err.status || 500).json({
      error: err.code,
      code: null,
      details: err.details ?? null,
      requestId: rid
    });
  }

  res.status(500).json({
    error: 'unexpected',
    code: null,
    details: null,
    requestId: rid
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});