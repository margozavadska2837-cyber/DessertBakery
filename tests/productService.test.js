// tests/productService.test.js

jest.mock('../db/productRepository', () => ({
  create: jest.fn().mockResolvedValue({ id: 1, name: 'Торт', price: 150 }),
  getAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Торт', price: 150 }]),
  findById: jest.fn().mockResolvedValue({ id: 1, name: 'Торт', price: 150 }),
  update: jest.fn().mockResolvedValue({ id: 1, name: 'Оновлений торт', price: 200 }),
  delete: jest.fn().mockResolvedValue(true) 
}));

const service = require('../service/productService');
const { ApiError } = require('../errors/errorResponse');

describe('Product Service', () => {
  
  test('створює продукт з валідними даними', async () => {
    const product = await service.createProduct({ name: 'Торт', price: 150 });
    
    expect(product).toHaveProperty('id');
    expect(product.name).toBe('Торт');
  });

  test('кидає помилку при відсутності назви', async () => {
    await expect(service.createProduct({ price: 100 }))
      .rejects
      .toThrow(ApiError);
  });

  test('отримує список продуктів', async () => {
    const products = await service.getAllProducts();
    
    expect(Array.isArray(products)).toBe(true);
    expect(products[0].name).toBe('Торт');
  });

  test('оновлює продукт', async () => {
    const updated = await service.updateProduct(1, { name: 'Оновлений торт', price: 200 });
    
    expect(updated.name).toBe('Оновлений торт');
  });

  test('видаляє продукт', async () => {
    const result = await service.deleteProduct(1);
    
    expect(result).toBe(true);
  });
});