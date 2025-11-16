/* store.js — единый стейт меню/корзины
   хранение в localStorage, события onCartChange,
   запрет покупки недоступного товара
*/

const LS_KEY = 'mangal_cart_v1';

let _catalog = [
  /* ================== 🌯 ШАУРМА (shawarma) ================== */
  { 
    id: '1', 
    name: { ru: 'Шаурма в лаваше (курица)', en: 'Shawarma in lavash (chicken)', ky: 'Лаваштагы шаурма (тоок)' }, 
    desc: { ru: 'Нежная курица, свежие овощи, фирменный соус' }, 
    price: 220, 
    cat: 'shawarma', 
    tags: ['hit'], 
    available: true, 
    image: 'assets/img/item1.jpg' 
  },
  { 
    id: '2', 
    name: { ru: 'Шаурма в лаваше (говядина)', en: 'Shawarma in lavash (beef)', ky: 'Лаваштагы шаурма (уй эти)' }, 
    desc: { ru: 'Сочная говядина, свежие овощи, фирменный соус' }, 
    price: 240, 
    cat: 'shawarma', 
    tags: [], 
    available: true, 
    image: 'assets/img/item2.jpg' 
  },
  { 
    id: '3', 
    name: { ru: 'Шаурма в лаваше (острая)', en: 'Spicy Shawarma in lavash', ky: 'Ачуу лаваштагы шаурма' }, 
    desc: { ru: 'Курица, жгучий перец, овощи, острый соус' }, 
    price: 230, 
    cat: 'shawarma', 
    tags: ['spicy'], 
    available: true, 
    image: 'assets/img/item3.jpg' 
  },
  { 
    id: '4', 
    name: { ru: 'Шаурма "Гиро" (курица)', en: 'Gyro Shawarma (chicken)', ky: '"Гиро" шаурма (тоок)' }, 
    desc: { ru: 'Особый рецепт с картофелем фри и соусом дзадзики' }, 
    price: 250, 
    cat: 'shawarma', 
    tags: ['hit'], 
    available: true, 
    image: 'assets/img/item4.jpg' 
  },

  /* ================== 🥗 САЛАТЫ (salad) ================== */
  { 
    id: '5', 
    name: { ru: 'Салат Греческий', en: 'Greek Salad', ky: 'Грек салаты' }, 
    desc: { ru: 'Свежие овощи, сыр фета, оливки, оливковое масло' }, 
    price: 180, 
    cat: 'salad', 
    tags: ['veg'], 
    available: true, 
    image: 'assets/img/item2.jpg' 
  },
  { 
    id: '6', 
    name: { ru: 'Салат Цезарь', en: 'Caesar Salad', ky: 'Цезарь салаты' }, 
    desc: { ru: 'Куриная грудка, сухарики, пармезан, соус "Цезарь"' }, 
    price: 200, 
    cat: 'salad', 
    tags: [], 
    available: true, 
    image: 'assets/img/item2.jpg' 
  },
  { 
    id: '7', 
    name: { ru: 'Салат Овощной', en: 'Vegetable Salad', ky: 'Жашылча салаты' }, 
    desc: { ru: 'Свежие помидоры, огурцы, зелень, заправка' }, 
    price: 150, 
    cat: 'salad', 
    tags: ['veg'], 
    available: true, 
    image: 'assets/img/item2.jpg' 
  },

  /* ================== 🍰 ДЕСЕРТЫ (desserts) ================== */
  { 
    id: '8', 
    name: { ru: 'Чизкейк', en: 'Cheesecake', ky: 'Чизкейк' }, 
    desc: { ru: 'Классический чизкейк "Нью-Йорк" с ягодным соусом' }, 
    price: 160, 
    cat: 'desserts', 
    tags: [], 
    available: true, 
    image: 'assets/img/item3.jpg' 
  },
  { 
    id: '9', 
    name: { ru: 'Тирамису', en: 'Tiramisu', ky: 'Тирамису' }, 
    desc: { ru: 'Нежный итальянский десерт с кофе и маскарпоне' }, 
    price: 180, 
    cat: 'desserts', 
    tags: [], 
    available: true, 
    image: 'assets/img/item3.jpg' 
  },

  /* ================== 🔥 ГОРЯЧЕЕ (hot) ================== */
  { 
    id: '10', 
    name: { ru: 'Плов', en: 'Pilaf', ky: 'Палоо' }, 
    desc: { ru: 'Традиционный плов с рисом, мясом и специями' }, 
    price: 280, 
    cat: 'hot', 
    tags: [], 
    available: false, // <-- НЕТ В НАЛИЧИИ
    image: 'assets/img/item4.jpg' 
  },
  { 
    id: '11', 
    name: { ru: 'Манты', en: 'Manti', ky: 'Манты' }, 
    desc: { ru: 'Сочные манты с говядиной, 5 шт.' }, 
    price: 260, 
    cat: 'hot', 
    tags: [], 
    available: true, 
    image: 'assets/img/item4.jpg' 
  },
  { 
    id: '12', 
    name: { ru: 'Лагман', en: 'Lagman', ky: 'Лагман' }, 
    desc: { ru: 'Густой и наваристый, с мясом и тянутой лапшой' }, 
    price: 250, 
    cat: 'hot', 
    tags: [], 
    available: true, 
    image: 'assets/img/item4.jpg' 
  },

  /* ================== 🥤 НАПИТКИ (drinks) ================== */
  { 
    id: '13', 
    name: { ru: 'Кола / Спрайт / Фанта', en: 'Coke / Sprite / Fanta', ky: 'Кола / Спрайт / Фанта' }, 
    desc: { ru: 'Газированный напиток в бутылке, 0.5 л' }, 
    price: 100, 
    cat: 'drinks', 
    tags: [], 
    available: true, 
    image: 'assets/img/item5.jpg' 
  },
  { 
    id: '14', 
    name: { ru: 'Компот', en: 'Compote', ky: 'Компот' }, 
    desc: { ru: 'Домашний компот из сухофруктов, 1 стакан' }, 
    price: 80, 
    cat: 'drinks', 
    tags: [], 
    available: true, 
    image: 'assets/img/item5.jpg' 
  },
  { 
    id: '15', 
    name: { ru: 'Чай (черный/зеленый)', en: 'Tea (black/green)', ky: 'Чай (кара/жашыл)' }, 
    desc: { ru: 'Ароматный чай в чайничке, 0.5 л' }, 
    price: 50, 
    cat: 'drinks', 
    tags: ['new'], // <-- НОВИНКА
    available: true, 
    image: 'assets/img/item5.jpg' 
  },
  { 
    id: '16', 
    name: { ru: 'Кофе (американо)', en: 'Coffee (Americano)', ky: 'Кофе (американо)' }, 
    desc: { ru: 'Свежесваренный американо' }, 
    price: 100, 
    cat: 'drinks', 
    tags: ['new'], // <-- НОВИНКА
    available: true, 
    image: 'assets/img/item5.jpg' 
  },
  { 
    id: '17', 
    name: { ru: 'Капучино', en: 'Cappuccino', ky: 'Капучино' }, 
    desc: { ru: 'Классический капучино с молочной пенкой' }, 
    price: 120, 
    cat: 'drinks', 
    tags: ['new'], // <-- НОВИНКА
    available: true, 
    image: 'assets/img/item5.jpg' 
  }
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

