const API_BASE = '/products';

const container = document.querySelector('.products .box-container');
const totalCountEl = document.getElementById('total-count');
const addBtn = document.getElementById('add-btn');

let consecutiveFailures = 0;
const MAX_FAILURES = 3;

async function fetchWithResilience(url, opts = {}) {
  console.log('Запит на сервер:', url);

  const { retry = {}, idempotencyKey, requestId, ...init } = opts;
  const { retries = 2, baseDelayMs = 300, timeoutMs = 3500, jitter = true } = retry;

  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey);
  headers.set('X-Request-Id', requestId ?? crypto.randomUUID());

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...init, headers, signal: controller.signal });

    if (res.status === 429 && retries > 0) {
      const ra = Number(res.headers.get('Retry-After') || 1) * 1000;
      await sleep(ra);
      return fetchWithResilience(url, { ...opts, retry: { ...retry, retries: retries - 1 } });
    }

    if ([502,503,504].includes(res.status) && retries > 0) {
      const attempt = (opts.__a ?? 0);
      await sleep(backoff(baseDelayMs, attempt, jitter));
      return fetchWithResilience(url, { ...opts, __a: attempt + 1, retry: { ...retry, retries: retries - 1 } });
    }

    consecutiveFailures = 0;
    return res;
  } catch (e) {
    console.log('Помилка fetch:', e.message);

    if (retries > 0) {
      const attempt = (opts.__a ?? 0);
      await sleep(backoff(baseDelayMs, attempt, jitter));
      return fetchWithResilience(url, { ...opts, __a: attempt + 1, retry: { ...retry, retries: retries - 1 } });
    }
    consecutiveFailures++;
    if (consecutiveFailures >= MAX_FAILURES) showDegradedMode();
    throw e;
  } finally {
    clearTimeout(t);
  }
}

function backoff(base, attempt, jitter = true) {
  let delay = base * Math.pow(2, attempt);
  if (jitter) delay = delay * (0.5 + Math.random() / 2);
  return delay;
}

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

function showDegradedMode() {
  console.log('Degraded mode activated')
  const banner = document.getElementById('degraded-banner');
  if (banner) banner.style.display = 'block';
  document.querySelectorAll('button').forEach(btn => btn.disabled = true);
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

function productCardHtml(p) {
  const id = p.id ?? p.Id ?? '';
  const name = p.name ?? p.Name ?? '';
  const desc = p.description ?? p.Description ?? '';
  const price = (p.price ?? p.Price ?? 0);
  const currency = p.currency ?? p.Currency ?? 'UAH';
  const imageName = p.image ?? '';
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

async function apiFetch(path = '', opts = {}) {
  const res = await fetchWithResilience(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    let payload;
    try { payload = await res.json(); } catch(e) { payload = { message: res.statusText }; }
    const err = new Error('API Error');
    err.status = res.status;
    err.body = payload;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

async function loadProducts() {
  try {
    const products = await apiFetch('/');
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

const idemStore = new Map();
async function getOrReuseKey(payload) {
  const hash = JSON.stringify(payload);
  if (!idemStore.has(hash)) idemStore.set(hash, crypto.randomUUID());
  return idemStore.get(hash);
}

async function addProduct() {
  const name = document.querySelector('#name').value.trim();
  const priceRaw = document.querySelector('#price').value;
  const description = document.querySelector('#description').value.trim();
  const currency = (document.querySelector('#currency').value || 'UAH').trim();
  const image = document.querySelector('#image').value.trim();

  const payload = { name, description, price: Number(priceRaw), currency, image };
  if (!name || !priceRaw || isNaN(payload.price) || !description) {
    console.error('Помилка: заповніть всі обов’язкові поля');
    return;
  }

  const idemKey = await getOrReuseKey(payload);

  try {
    const data = await fetchWithResilience('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
      idempotencyKey: idemKey,
      retry: { retries: 2, baseDelayMs: 300, timeoutMs: 3500, jitter: true }
    });

    document.querySelector('#name').value = '';
    document.querySelector('#price').value = '';
    document.querySelector('#description').value = '';
    document.querySelector('#currency').value = 'UAH';
    document.querySelector('#image').value = '';

    await loadProducts();
    console.log('Продукт додано', data);
  } catch (err) {
    console.error('Помилка при додаванні продукту', err);
  }
}

container?.addEventListener('click', async (ev) => {
  const box = ev.target.closest('.box');
  if (!box) return;
  const id = box.dataset.id;

  if (ev.target.closest('.view-btn')) await openModalFor(id, false);
  else if (ev.target.closest('.edit-btn')) await openModalFor(id, true);
  else if (ev.target.closest('.delete-btn')) {
    if (!confirm('Видалити продукт?')) return;
    try { await apiFetch(`/${id}`, { method: 'DELETE' }); await loadProducts(); }
    catch(e){ console.error('Delete failed', e); alert('Не вдалося видалити продукт'); }
  }
});

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

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
function closeModal() {
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

  if (!name || !priceRaw || isNaN(Number(priceRaw)) || !description) {
    console.error('Помилка: заповніть всі обов’язкові поля');
    return;
  }

  try {
    await apiFetch(`/${modalCurrentId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, price: Number(priceRaw), description, currency })
    });
    await loadProducts();
    closeModal();
  } catch (err) {
    console.error('Помилка при збереженні продукту', err);
  }
});

modalDelete.addEventListener('click', async () => {
  if (!modalCurrentId || !confirm('Підтвердити видалення?')) return;
  try {
    await apiFetch(`/${modalCurrentId}`, { method: 'DELETE' });
    closeModal();
    await loadProducts();
  } catch (err) {
    console.error('Delete failed', err);
    alert('Не вдалося видалити продукт');
  }
});

document.getElementById('refresh-btn')?.addEventListener('click', loadProducts);
addBtn?.addEventListener('click', addProduct);

document.addEventListener('DOMContentLoaded', loadProducts);