// Общая инициализация: язык, шрифты, тосты, делегирование
// app.js
const LS_LANG = 'ordify_lang';
const LS_TOKEN = 'ordify_token';

// -------- i18n ----------
let currentLang = localStorage.getItem(LS_LANG) || 'ru';
let dict = {};

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(LS_LANG, lang);
  return loadI18n().then(applyI18n);
}

export function getLang() { return currentLang; }

export async function loadI18n() {
  try {
    const res = await fetch(`/i18n/${currentLang}.json`, { cache: 'no-store' });
    dict = await res.json();
  } catch {
    dict = {};
  }
}

export function t(key, fallback = '') {
  return (dict && dict[key]) || fallback || key;
}

export function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key, el.textContent);
  });
  // placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key, el.getAttribute('placeholder') || ''));
  });
  document.title = t('app.title', document.title);
}

// -------- UI: Toast ----------
const toastRoot = document.getElementById('toast-container');
export function toast(msg, type = 'ok') {
  if (!toastRoot) return;
  const div = document.createElement('div');
  div.className = `toast ${type === 'ok' ? 'toast--ok' : 'toast--err'}`;
  div.textContent = msg;
  toastRoot.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}

// -------- Helpers ----------
export const formatPrice = (num) => `${Number(num).toFixed(0)} сом`;

export function debounce(fn, ms = 250) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// token helpers (на будущее быстрая регистрация)
export const auth = {
  saveToken(token) { localStorage.setItem(LS_TOKEN, token); },
  getToken() { return localStorage.getItem(LS_TOKEN); },
  clear() { localStorage.removeItem(LS_TOKEN); }
};

// init on load
(async function init() {
  // язык из localStorage
  const select = document.getElementById('lang-select');
  if (select) {
    select.value = currentLang;
    select.addEventListener('change', async (e) => {
      await setLang(e.target.value);
    });
  }

  await loadI18n();
  applyI18n();
})();

/* ====== Мини-Store корзины (без отдельного файла) ====== */
(function (global) {
  const KEY = 'cart_v1';
  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(cart)) cart = [];
  } catch (e) {
    cart = [];
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(cart));
    global.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
  }

  function findIndex(id) {
    return cart.findIndex((x) => String(x.id) === String(id));
  }

  const Store = {
    all() { return cart.map(i => ({ ...i })); },

    add(item) {
      if (!item || !item.id) return;
      const idx = findIndex(item.id);
      if (idx >= 0) {
        cart[idx].qty += (item.qty || 1);
      } else {
        cart.push({
          id: item.id,
          name: item.name || '',
          price: Number(item.price || 0),
          qty: Number(item.qty || 1),
          tags: item.tags || [],
          category: item.category || ''
        });
      }
      save();
    },

    setQty(id, qty) {
      const idx = findIndex(id);
      if (idx < 0) return;
      qty = Number(qty);
      if (qty <= 0) {
        cart.splice(idx, 1);
      } else {
        cart[idx].qty = qty;
      }
      save();
    },

    remove(id) {
      const idx = findIndex(id);
      if (idx < 0) return;
      cart.splice(idx, 1);
      save();
    },

    clear() {
      cart = [];
      save();
    },

    total() {
      return cart.reduce((s, i) => s + i.price * i.qty, 0);
    }
  };

  global.Store = Store;
})(window);
/* ====== /Мини-Store ====== */
