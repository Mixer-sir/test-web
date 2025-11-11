// assets/js/store.js
// Минимальный стор корзины. Без зависимостей. Работает в браузере/Live Server.

const KEY = 'cart_v1';
let cart;

// Читаем cart из localStorage (с защитой)
try {
  cart = JSON.parse(localStorage.getItem(KEY) || '{}');
} catch (_) {
  cart = {};
}

const subs = new Set();
const notify = () => subs.forEach(fn => {
  try { fn(cart); } catch (_) {}
});

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (_) {}
  notify();
}

// API
export function onCartChange(fn) { subs.add(fn); return () => subs.delete(fn); }
export function getCart() { return cart; }
export function getQty(id) { return cart[id]?.qty || 0; }
export function saveCart(next) {
  cart = next || cart;
  persist();
}

export function addItem(id, qty = 1) {
  const q = getQty(id) + qty;
  cart[id] = { qty: q };
  persist();
}

export function changeQty(id, delta) {
  const q = getQty(id) + delta;
  if (q <= 0) delete cart[id];
  else cart[id] = { qty: q };
  persist();
}

export function clearCart() {
  cart = {};
  persist();
}

// Сокращение «сом» для узких экранов (UX-правило)
export function getCurrencySymbol(lang = getLangSafe()) {
  // «с» на узких, «сом» — стандарт
  const narrow = window.matchMedia && window.matchMedia('(max-width: 420px)').matches;
  return narrow ? 'с' : 'сом';
}

// Чтобы не таскать i18n сюда — читаем язык безопасно, если нужен.
function getLangSafe() {
  try { return localStorage.getItem('lang') || 'ru'; } catch (_) { return 'ru'; }
}
