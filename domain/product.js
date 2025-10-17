// domain/product.js
class Product {
  constructor({ id, name, description, price, currency, createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.description = description || '';
    this.price = price;
    this.currency = currency || 'UAH';
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }
}

module.exports = Product;