class Customer {
  constructor(id, name, email, phone, address) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.orders = [];
  }

  updateAddress(newAddress) {
    this.address = newAddress;
  }

  addOrder(order) {
    this.orders.push(order);
  }

  getOrderHistory() {
    return this.orders;
  }

  leaveReview(product, review) {
    product.addReview(review);
  }
}
