const express = require('express');
const router = express.Router();
const service = require('../service/productService');

router.get('/', async (req, res, next) => {
  try {
    const products = await service.getAllProducts();
    res.json(products);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const created = await service.createProduct(req.body);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const updated = await service.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await service.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;