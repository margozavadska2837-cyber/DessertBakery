// service/productService.js
// const repo = require('../db/productRepository');
const repo = require('../db/productRepositoryInMemory');

const ApiError = require('../errors/errorResponse');

function validatePayload(payload) {
  const details = [];
  if (!payload || typeof payload !== 'object') {
    details.push({ field: 'payload', message: 'Payload is required' });
    return details;
  }
  if (!payload.name || String(payload.name).trim().length === 0) {
    details.push({ field: 'name', message: 'Name is required' });
  }
  if (payload.price == null || isNaN(Number(payload.price)) || Number(payload.price) < 0) {
    details.push({ field: 'price', message: 'Price must be a non-negative number' });
  }
  return details;
}

async function createProduct(payload) {
  const errors = validatePayload(payload);
  if (errors.length) throw new ApiError({ status: 400, code: 'INVALID_PAYLOAD', details: errors });

  const created = await repo.create({
    name: String(payload.name).trim(),
    description: payload.description || '',
    price: Number(payload.price),
    currency: payload.currency || 'UAH'
  });

  return created;
}

async function getAllProducts() {
  return await repo.getAll();
}

async function getProductById(id) {
  const product = await repo.findById(id);
  if (!product) throw new ApiError({ status: 404, code: 'PRODUCT_NOT_FOUND', details: [{ message: `Product ${id} not found` }] });
  return product;
}

async function updateProduct(id, payload) {
  const errors = validatePayload(payload);
  if (errors.length) throw new ApiError({ status: 400, code: 'INVALID_PAYLOAD', details: errors });

  const updated = await repo.update(id, {
    name: String(payload.name).trim(),
    description: payload.description || '',
    price: Number(payload.price),
    currency: payload.currency || 'UAH'
  });

  if (!updated) throw new ApiError({ status: 404, code: 'PRODUCT_NOT_FOUND', details: [{ message: `Product ${id} not found` }] });
  return updated;
}

async function deleteProduct(id) {
  const existing = await repo.findById(id);
  if (!existing) throw new ApiError({ status: 404, code: 'PRODUCT_NOT_FOUND', details: [{ message: `Product ${id} not found` }] });
  await repo.delete(id);
  return true;
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById, // тепер точно співпадає
  updateProduct,
  deleteProduct
};
