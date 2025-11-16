/* store.js — единый стейт меню/корзины
   хранение в localStorage, события onCartChange,
   запрет покупки недоступного товара
*/

const LS_KEY = 'mangal_cart_v1';

let _catalog = [
  // 👇 можешь расширять; id — строка
  { id: '1', name: { ru: 'Шаурма классическая', en: 'Classic Shawarma', ky: 'Классикалык шаверма' }, desc: { ru: 'Курица, соус, овощи' }, price: 220, cat: 'shawarma', tags: ['hit'], available: true, image: 'assets/img/item1.jpg' },
  { id: '2', name: { ru: 'Шаурма острая', en: 'Spicy Shawarma', ky: 'Ачуу шаверма' }, desc: { ru: 'Перец, специи' }, price: 240, cat: 'shawarma', tags: ['spicy'], available: true, image: 'assets/img/item2.jpg' },
  { id: '3', name: { ru: 'Салат овощной', en: 'Veggie Salad', ky: 'Жашылча салаты' }, desc: { ru: 'Огурцы, помидоры' }, price: 150, cat: 'salad', tags: ['veg'], available: true, image: 'assets/img/item3.jpg' },
  { id: '4', name: { ru: 'Плов', en: 'Pilaf' }, desc: { ru: 'Рис, мясо' }, price: 280, cat: 'hot', tags: [], available: false, image: 'assets/img/item4.jpg' }, // нет в наличии
];

let _cart = loadCart();
let _subs = new Set();

function loadCart() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // валидация
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(x => x && typeof x.id === 'string' && Number.isFinite(+x.qty) && +x.qty > 0)
                 .map(x => ({ id: x.id, qty: +x.qty }));
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(LS_KEY, JSON.stringify(_cart));
  _subs.forEach(fn => { try { fn(getCart()); } catch {} });
}

export function onCartChange(fn) { _subs.add(fn); return () => _subs.delete(fn); }

export function getCatalog() { return _catalog.slice(); }

export function setCatalog(list) {
  if (Array.isArray(list)) { _catalog = list; }
}

export function getCart() {
  // нормализуем, убирая позиции с товарами, которых уже нет
  const ids = new Set(_catalog.map(i => i.id));
  _cart = _cart.filter(x => ids.has(x.id) && x.qty > 0);
  return _cart.map(x => ({ ...x })); // копия
}

export function getItemById(id) {
  return _catalog.find(i => i.id === id) || null;
}

export function canAdd(id) {
  const item = getItemById(id);
  return !!(item && item.available);
}

export function addItem(id, qty = 1) {
  const item = getItemById(id);
  if (!item || !item.available) return false;
  const n = _cart.find(x => x.id === id);
  if (n) n.qty += qty;
  else _cart.push({ id, qty });
  saveCart();
  return true;
}

export function changeQty(id, delta) {
  const n = _cart.find(x => x.id === id);
  if (!n) return;
  n.qty += delta;
  if (n.qty <= 0) {
    _cart = _cart.filter(x => x.id !== id);
  }
  saveCart();
}

export function removeItem(id) {
  _cart = _cart.filter(x => x.id !== id);
  saveCart();
}

export function clear() {
  _cart = [];
  saveCart();
}

export function getQty(id) {
  const n = _cart.find(x => x.id === id);
  return n ? n.qty : 0;
}

export function getSummary() {
  const withInfo = getCart().map(row => {
    const item = getItemById(row.id);
    const price = item ? item.price : 0;
    return { ...row, price, sum: price * row.qty, item };
  });
  const total = withInfo.reduce((s, r) => s + r.sum, 0);
  const count = withInfo.reduce((s, r) => s + r.qty, 0);
  return { total, count, rows: withInfo };
}

// “сом”/“с” — версию с «с» можно форсить на мобильных через CSS
export function getCurrencySymbol(lang = 'ru') {
  return 'сом';
}
