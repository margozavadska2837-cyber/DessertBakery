class Product {
  constructor(id, name, price, stock) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
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
