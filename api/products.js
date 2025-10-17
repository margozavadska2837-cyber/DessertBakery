const express = require('express');
const router = express.Router();
const service = require('../service/productService'); // in-memory repo

// GET all products
router.get('/', async (req, res, next) => {
  try {
    const products = await service.getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET product by id <-- Ось що треба додати
router.get('/:id', async (req, res, next) => {
  try {
    const product = await service.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST new product
router.post('/', async (req, res, next) => {
  try {
    const product = await service.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /:id
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await service.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id
router.delete('/:id', async (req, res, next) => {
  try {
    await service.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
