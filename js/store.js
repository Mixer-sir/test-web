// js/store.js
// Единый источник правды для каталога и корзины.
// Корзина хранится в localStorage под ключом LS_KEY.
// Важно: этот файл используется и на главной (menu.js), и на cart.html.

const LS_KEY = 'ordify_cart_v1';


// ==== Каталог (демо). Потом можно заменить на fetch() из БД ====
const CATALOG = [
  {
    id: '1',
    name: { ru: 'Шаурма классическая', en: 'Classic Shawarma', ky: 'Классикалык шаверма' },
    desc: { ru: 'Курица, соус, овощи', en: 'Chicken, sauce, veggies', ky: 'Товук, соус, жашылча' },
    price: 220,
    cat: 'shawarma',
    tags: ['hit'],
    available: true,
    image: 'assets/img/shawarma1.jpg'
  },
  {
    id: '2',
    name: { ru: 'Шаурма острая', en: 'Spicy Shawarma', ky: 'Ачуу шаверма' },
    desc: { ru: 'Перец, специи', en: 'Chili, spices', ky: 'Кочкул, татымдар' },
    price: 240,
    cat: 'shawarma',
    tags: ['spicy'],
    available: true,
    image: 'assets/img/shawarma2.jpg'
  },
  {
    id: '3',
    name: { ru: 'Салат овощной', en: 'Veggie Salad', ky: 'Жашылча салаты' },
    desc: { ru: 'Огурцы, помидоры', en: 'Cucumbers, tomatoes', ky: 'Бадыркан, помидор' },
    price: 150,
    cat: 'salad',
    tags: ['veg'],
    available: true,
    image: 'assets/img/salad1.jpg'
  },
  {
    id: '3',
    name: { ru: 'Кофе', en: 'Coffe', ky: 'Кофе' },
    desc: { ru: 'Огурцы, помидоры', en: 'Cucumbers, tomatoes', ky: 'Бадыркан, помидор' },
    price: 150,
    cat: 'drinks',
    tags: ['veg', 'hit'],
    available: false,
    image: 'assets/img/coffe1.jpg'
  }
];

// ==== Состояние корзины (in-memory) ====
let _cart = loadCart();

// ==== Подписчики на изменение корзины ====
const _subs = new Set();
function emit() { _subs.forEach(fn => { try { fn(getCart()); } catch {} }); }
export function onCartChange(cb) { _subs.add(cb); return () => _subs.delete(cb); }

// ==== Работа с localStorage ====
function loadCart() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { items: {}, currency: 'KGS' };
    const parsed = JSON.parse(raw);
    if (!parsed.items) parsed.items = {};
    return parsed;
  } catch (e) {
    console.warn('loadCart failed', e);
    return { items: {}, currency: 'KGS' };
  }
}

function saveCart() {
  localStorage.setItem(LS_KEY, JSON.stringify(_cart));
  emit();
}

// ==== Экспорт каталога и корзины ====
export function getCatalog() { return CATALOG.slice(); }

export function getCart() {
  // отдаём копию, чтобы извне не трогали напрямую
  return JSON.parse(JSON.stringify(_cart));
}

export function clearCart() {
  _cart = { items: {}, currency: _cart.currency || 'KGS' };
  saveCart();
}

export function getQty(id) {
  return _cart.items[id] || 0;
}

export function addItem(id, qty = 1) {
  if (!canAdd(id)) return false;                // <-- блокируем добавление, если нет в наличии
  const cur = read();
  cur[id] = (cur[id] || 0) + qty;
  if (cur[id] <= 0) delete cur[id];
  write(cur);
  emit();
  return true;
}

export function changeQty(id, delta) {
  const cur = read();
  cur[id] = (cur[id] || 0) + delta;
  if (cur[id] <= 0) delete cur[id];
  write(cur);
  emit();
}

// символьное обозночение валюты — можно донастроить по языку
export function getCurrencySymbol() { return 'сом'; }

// Синхронизация между вкладками (если открыл две)
window.addEventListener('storage', (e) => {
  if (e.key === LS_KEY) {
    _cart = loadCart();
    emit();
  }
});

export function canAdd(id) {
  const it = CATALOG.find(x => x.id === id);
  return !!it && it.available === true;
}

export function getSummary() {
  const cart = read();
  let total = 0;
  let count = 0;
  for (const [id, q] of Object.entries(cart)) {
    const it = CATALOG.find(x => x.id === id);
    if (!it) continue;
    total += it.price * q;
    count += q;
  }
  return { total, count };
}