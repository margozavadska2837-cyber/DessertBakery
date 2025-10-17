// public/js/script.js
const API_BASE = '/products';

const container = document.querySelector('.products .box-container');
const totalCountEl = document.getElementById('total-count');
const addBtn = document.getElementById('add-btn');

async function apiFetch(path = '', opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    let payload;
    try {
      payload = await res.json(); 
    } catch(e) { payload = { message: res.statusText }; }
    const err = new Error('API Error');
    err.status = res.status;
    err.body = payload;
    throw err;
  }
  // for 204 No Content
  if (res.status === 204) return null;
  return await res.json();
}

function productCardHtml(p) {
  const id = p.id ?? p.Id ?? '';
  const name = p.name ?? p.Name ?? '';
  const desc = p.description ?? p.Description ?? '';
  const price = (p.price ?? p.Price ?? 0);
  const currency = p.currency ?? p.Currency ?? 'UAH';

  const imageName = p.image ?? ''; // беремо назву картинки з продукту
  const imgHtml = imageName
    ? `<img src="/images/${escapeHtml(imageName)}" alt="${escapeHtml(name)}" />`
    : '';
  
  
  return `
    <div class="box" data-id="${id}">

    ${imgHtml}


      <h3>${escapeHtml(name)}</h3>
      <p>${escapeHtml(desc || '')}</p>
      <div class="price">${price} ${currency}</div>
      <div class="icons">
        <button class="view-btn" title="Переглянути"><i class="fas fa-eye"></i></button>
        <button class="edit-btn" title="Редагувати"><i class="fas fa-edit"></i></button>
        <button class="delete-btn" title="Видалити" style="color:#e11"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadProducts() {
  try {
    const products = await apiFetch(`/`);
    renderProducts(products || []);
  } catch (err) {
    console.error('Failed to load products', err);
    container.innerHTML = `<div style="color:#900">Не вдалося завантажити продукти</div>`;
  }
}


function renderProducts(list) {
  totalCountEl.textContent = `Всього: ${list.length}`;
  if (!list || list.length === 0) {
    container.innerHTML = '<p>Продукти відсутні</p>';
    return;
  }
  container.innerHTML = list.map(p => productCardHtml(p)).join('');
}

/* Create */
async function addProduct() {
  const name = document.querySelector('#name').value.trim();
  const priceRaw = document.querySelector('#price').value;
  const description = document.querySelector('#description').value.trim();
  const currency = (document.querySelector('#currency').value || 'UAH').trim();
  const image = document.querySelector('#image').value.trim();

  // Валідація даних
  if (!name) {
    console.error('Помилка: Назва продукту не може бути порожньою');
    return;
  }
  if (!priceRaw) {
    console.error('Помилка: Ціна продукту не може бути порожньою');
    return;
  }
  const price = Number(priceRaw);
  if (isNaN(price) || price < 0) {
    console.error('Помилка: Ціна повинна бути невідʼємним числом');
    return;
  }
  if (!description) {
    console.error('Помилка: Опис продукту не може бути порожнім');
    return;
  }

  // Якщо все ок — робимо POST
  try {
    await apiFetch('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price, currency, image })
    });

    // Очистка полів
    document.querySelector('#name').value = '';
    document.querySelector('#price').value = '';
    document.querySelector('#description').value = '';
    document.querySelector('#currency').value = 'UAH';
    document.querySelector('#image').value = '';

    await loadProducts();
    console.log('Продукт додано');

  } catch (err) {
    console.error('Помилка при додаванні продукту', err);
  }
}

/* Delegation for view/edit/delete */
container?.addEventListener('click', async (ev) => {
  const box = ev.target.closest('.box');
  if (!box) return;
  const id = box.dataset.id;
  if (ev.target.closest('.view-btn')) {
    await openModalFor(id, false);
  } else if (ev.target.closest('.edit-btn')) {
    await openModalFor(id, true);
  } else if (ev.target.closest('.delete-btn')) {
    if (!confirm('Видалити продукт?')) return;
    try {
      await apiFetch(`/${id}`, { method: 'DELETE' });
      await loadProducts();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Не вдалося видалити продукт');
    }
  }
});

/* Modal logic */
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalId = document.getElementById('modal-id');
const modalName = document.getElementById('modal-name');
const modalPrice = document.getElementById('modal-price');
const modalCurrency = document.getElementById('modal-currency');
const modalDescription = document.getElementById('modal-description');
const modalClose = document.getElementById('modal-close');
const modalSave = document.getElementById('modal-save');
const modalDelete = document.getElementById('modal-delete');

let modalEditing = false;
let modalCurrentId = null;

async function openModalFor(id, editing) {
  try {
    const product = await apiFetch(`/${id}`);
    modalCurrentId = product.id ?? product.Id ?? id;
    modalTitle.textContent = editing ? 'Редагування продукту' : 'Перегляд продукту';
    modalId.textContent = modalCurrentId;
    modalName.value = product.name ?? product.Name ?? '';
    modalPrice.value = product.price ?? product.Price ?? '';
    modalCurrency.value = product.currency ?? product.Currency ?? 'UAH';
    modalDescription.value = product.description ?? product.Description ?? '';
    modalEditing = !!editing;
    modalSave.style.display = editing ? 'inline-block' : 'none';
    modalDelete.style.display = editing ? 'inline-block' : 'none';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  } catch (err) {
    console.error('Failed to load product', err);
    alert('Не вдалося отримати продукт');
  }
}

modalClose.addEventListener('click', () => closeModal());
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

async function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modalCurrentId = null;
  modalEditing = false;
}

modalSave.addEventListener('click', async () => {
  if (!modalCurrentId) return;

  const name = modalName.value.trim();
  const priceRaw = modalPrice.value;
  const description = modalDescription.value.trim();
  const currency = (modalCurrency.value || 'UAH').trim();

  // Валідація полів
  if (!name) {
    console.error('Помилка: Назва продукту не може бути порожньою');
    return;
  }

  if (!priceRaw) {
    console.error('Помилка: Ціна продукту не може бути порожньою');
    return;
  }

  const price = Number(priceRaw);
  if (isNaN(price) || price < 0) {
    console.error('Помилка: Ціна повинна бути невідʼємним числом');
    return;
  }

  if (!description) {
    console.error('Помилка: Опис продукту не може бути порожнім');
    return;
  }

  // Всі дані валідні — надсилаємо PUT
  try {
    await apiFetch(`/${modalCurrentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, description, currency })
    });
    console.log('Продукт оновлено');
    await loadProducts();
    closeModal();
  } catch (err) {
    console.error('Помилка при збереженні продукту', err);
  }
});


modalDelete.addEventListener('click', async () => {
  if (!modalCurrentId) return;
  if (!confirm('Підтвердити видалення?')) return;
  try {
    await apiFetch(`/${modalCurrentId}`, { method: 'DELETE' });
    closeModal();
    await loadProducts();
  } catch (err) {
    console.error('Delete failed', err);
    alert('Не вдалося видалити продукт');
  }
});

/* UI hooks */
document.getElementById('refresh-btn')?.addEventListener('click', loadProducts);
addBtn?.addEventListener('click', addProduct);

/* init */
document.addEventListener('DOMContentLoaded', loadProducts);