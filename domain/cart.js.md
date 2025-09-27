class CartItem {
 constructor (productId, price, quantity) f
  this-productId = productid;
  this-price = price;
  this quantity = quantity;
}

getTotal(){
  return this price * this-quantity;
}
}

class Cart {
 constructor (customerId) {
  this.customerid = customerId;
  this.items - [];
}

addIten(productId, price, quantity) {
  this.items.push(new CartItem(productId, price, quantity));
}

removeltem(productId) {
this.items = this.items.filter(i => i.productId I== productId);
}

getTotal() {
return this.items.reduce((sum, item) => sum + item. getTotal(), 0);
}
}