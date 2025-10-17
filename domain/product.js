// domain/product.js
class Product {
  constructor({ id, name, description, price, currency, stock, createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.description = description || '';
    this.price = price;
    this.currency = currency || 'UAH';
    this.stock = stock || 0;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
    this.reviews = [];
  }

  isAvailable(quantity = 1) {
    return this.stock >= quantity;
  }

  sell(quantity = 1) {
    if (this.isAvailable(quantity)) {
      this.stock -= quantity;
      return true;
    }
    return false;
  }

  addReview(review) {
    this.reviews.push(review);
  }
}

module.exports = Product;
