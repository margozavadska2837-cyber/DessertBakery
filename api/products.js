const express = require('express');
const router = express.Router();
const service = require('../service/productService'); 
const crypto = require('crypto');

const idemStore = new Map(); 

router.get('/', async (req, res, next) => {
  try {
    const products = await service.getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await service.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'not_found', requestId: req.rid });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const key = req.get('Idempotency-Key');
    const rid = req.rid || crypto.randomUUID();
    if (!key) return res.status(400).json({ error: 'idempotency_key_required', requestId: rid });

    if (idemStore.has(key)) {
      return res.status(201).json({ ...idemStore.get(key), requestId: rid });
    }

    const product = await service.createProduct(req.body);
    idemStore.set(key, product);
    res.status(201).json({ ...product, requestId: rid });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const updated = await service.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'not_found', requestId: req.rid });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await service.deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'not_found', requestId: req.rid });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
