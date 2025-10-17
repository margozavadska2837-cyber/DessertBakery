// tests/productApi.test.js
const express = require('express');
const request = require('supertest');

jest.mock('../service/productService', () => ({
  createProduct: jest.fn().mockResolvedValue({ id: 1, name: 'Cake', price: 50 }),
  getAllProducts: jest.fn().mockResolvedValue([{ id: 1, name: 'Cake', price: 50 }]),
  getProductById: jest.fn().mockResolvedValue({ id: 1, name: 'Cake', price: 50 }),
  updateProduct: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Cake', price: 55 }),
  deleteProduct: jest.fn().mockResolvedValue(true)
}));

const productRouter = require('../controllers/productController');

const app = express();
app.use(express.json());
app.use('/api/products', productRouter);

describe('Product API', () => {
  test('GET /api/products — повертає список продуктів', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/products — створює новий продукт', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Cake', price: 50 });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Cake');
  });

  test('PUT /api/products/:id — оновлює продукт', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .send({ name: 'Updated Cake', price: 55 });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Cake');
  });

  test('DELETE /api/products/:id — видаляє продукт', async () => {
    const res = await request(app).delete('/api/products/1');
    expect(res.statusCode).toBe(204);
  });
});