class OrderItem {
 constructor (productId, price, quantity) {
  this-productId = productid;
  this-price = price;
  this quantity = quantity;
}
getTotal() {
return this price * this quantity;
}
}

class Order {
 constructor (customerId, items) {
  this customerId = customerId;
  this.items = items-map(i => new OrderItemi-productId, i-price, i-quantity));
  this status - 'pending'; // pending | confirmed | delivered
  this-createdAt = new Date();
}

getTotal() {
return this.items.reduce((sum, item) => sum + item-getTotal(), 0);
}

setStatus(status) {
this status = status;
}
}