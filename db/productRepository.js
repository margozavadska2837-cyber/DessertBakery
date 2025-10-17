require('dotenv').config();
const mssql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let poolPromise;

async function getPool() {
  if (!poolPromise) {
    poolPromise = mssql.connect(config);
  }
  return poolPromise;
}

function normalizeProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    currency: row.currency,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function create(product) {
  const pool = await getPool();
  const result = await pool.request()
    .input('name', mssql.NVarChar, product.name)
    .input('description', mssql.NVarChar, product.description)
    .input('price', mssql.Decimal(18, 2), product.price)
    .input('currency', mssql.NVarChar, product.currency)
    .query(`INSERT INTO Products (name, description, price, currency)
            OUTPUT INSERTED.*
            VALUES (@name, @description, @price, @currency)`);
  return normalizeProduct(result.recordset[0]);
}

async function getAll() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM Products');
  return result.recordset.map(normalizeProduct);
}

async function findById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', mssql.Int, id)
    .query('SELECT * FROM Products WHERE id = @id');
  return normalizeProduct(result.recordset[0]);
}

async function update(id, product) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', mssql.Int, id)
    .input('name', mssql.NVarChar, product.name)
    .input('description', mssql.NVarChar, product.description)
    .input('price', mssql.Decimal(18, 2), product.price)
    .input('currency', mssql.NVarChar, product.currency)
    .query(`UPDATE Products
            SET name = @name,
                description = @description,
                price = @price,
                currency = @currency
            OUTPUT INSERTED.*
            WHERE id = @id`);
  if (result.recordset.length === 0) return null;
  return normalizeProduct(result.recordset[0]);
}

async function deleteProduct(id) {
  const pool = await getPool();
  await pool.request()
    .input('id', mssql.Int, id)
    .query('DELETE FROM Products WHERE id = @id');
}

module.exports = {
  create,
  getAll,
  findById,
  update,
  delete: deleteProduct,
};