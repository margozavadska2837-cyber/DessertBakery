let products = [
  { id: 1, name: 'Торт "Наполеон"', description: 'Ніжний багатошаровий торт', price: 150, currency: 'UAH', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Круасан "Французький"', description: 'Хрусткий круасан з маслом', price: 160, currency: 'UAH', createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: 'Чизкейк "Класичний"', description: 'Кремовий чизкейк', price: 100, currency: 'UAH', createdAt: new Date(), updatedAt: new Date() },
];

function normalizeProduct(p) { return { ...p }; }

async function create(product) {
  const newProduct = { id: products.length + 1, ...product, createdAt: new Date(), updatedAt: new Date() };
  products.push(newProduct);
  return normalizeProduct(newProduct);
}

async function getAll() { return products.map(normalizeProduct); }
async function findById(id) { return normalizeProduct(products.find(p => p.id === Number(id))); }
async function update(id, product) {
  const idx = products.findIndex(p => p.id === Number(id));
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...product, updatedAt: new Date() };
  return normalizeProduct(products[idx]);
}
async function deleteProduct(id) { products = products.filter(p => p.id !== Number(id)); }

module.exports = { create, getAll, findById, update, delete: deleteProduct };
