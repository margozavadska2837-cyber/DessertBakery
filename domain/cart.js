class CartItem {
 constructor (productId, price, quantity) {
   this.productId = productId;
   this.price = price;
   this.quantity = quantity;
 }

 getTotal() {
   return this.price * this.quantity;
 }
}

class Cart {
  constructor(customerId) {
    this.customerId = customerId;
    this.items = [];
 }

  addItem(productId, price, quantity) {
    this.items.push(new CartItem(productId, price, quantity));
 }

  removeItem(productId) {
    this.items = this.items.filter(i => i.productId !== productId);
 }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.getTotal(), 0);
 }
}

