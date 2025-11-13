// js/cart.js
import { t, getLang } from './i18n.js';
import { getCart, getCatalog, changeQty } from './store.js';
import { toast } from './ui.js';

const listEl = document.getElementById('cart-list');
const sumEl  = document.getElementById('summary-sum');

const form   = document.getElementById('order-form');
const planBox = document.getElementById('plan-controls');
const dateEl = document.getElementById('plan-date');
const timeEl = document.getElementById('plan-time');

init();

function init() {
  renderCart();

  // toggle планирования
  form.querySelectorAll('input[name="when"]').forEach(r => {
    r.addEventListener('change', onWhenChange);
  });

  // формы
  form.addEventListener('submit', onSubmit);

  // подготовить min/max для планирования
  preparePlanLimits();
}

function renderCart() {
  const cart = getCart();            // {items: Map|Object, currency: 'KGS', ...}
  const catalog = getCatalog();      // массив объектов {id, name, desc, price, image, ...}
  const items = [];

  // строим плоский список {product, qty}
  for (const id in cart.items) {
    const qty = cart.items[id];
    const pr  = catalog.find(x => String(x.id) === String(id));
    if (!pr || qty <= 0) continue;
    items.push({ pr, qty });
  }

  listEl.innerHTML = '';
  if (!items.length) {
    listEl.innerHTML = `
      <li class="empty-state">
        <div class="empty-state__icon">🛒</div>
        <div class="empty-state__text">В корзине пусто</div>
      </li>`;
    sumEl.textContent = '0';
    return;
  }

  let total = 0;
  const cur = getCurrencySym();

  items.forEach(({pr, qty}) => {
    total += pr.price * qty;
    const name = pr.name?.[getLang()] || pr.name?.ru || pr.name || 'Без названия';
    const desc = pr.desc?.[getLang()] || pr.desc?.ru || pr.desc || '';

    const row = `
      <li class="cart-row" data-id="${pr.id}">
        <img class="cart-row__img" src="${pr.image || 'assets/img/placeholder.jpg'}" alt="">
        <div>
          <div class="cart-row__title">${name}</div>
          ${desc ? `<p class="cart-row__desc">${desc}</p>` : ''}
        </div>

        <div class="qty">
          <button class="qbtn dec" aria-label="Уменьшить" data-id="${pr.id}">−</button>
          <span class="qvalue" data-id="${pr.id}">${qty}</span>
          <button class="qbtn inc" aria-label="Увеличить" data-id="${pr.id}">+</button>
        </div>

        <div class="cart-row__price">
          ${pr.price * qty} <span class="currency">${cur}</span>
        </div>
      </li>`;
    listEl.insertAdjacentHTML('beforeend', row);
  });

  sumEl.textContent = total;

  // навешиваем события
  listEl.querySelectorAll('.qbtn').forEach(b => b.addEventListener('click', onStep));
}

function onStep(e) {
  const id = e.currentTarget.dataset.id;
  const inc = e.currentTarget.classList.contains('inc');
  const dec = e.currentTarget.classList.contains('dec');

  changeQty(id, inc ? +1 : -1);
  renderCart();
}

function onWhenChange(e) {
  const isPlan = e.currentTarget.value === 'plan';
  planBox.classList.toggle('hidden', !isPlan);

  if (isPlan) {
    preparePlanLimits();
  }
}

/** задаём min/max даты и времени */
function preparePlanLimits() {
  if (!dateEl || !timeEl) return;

  const now = new Date();
  now.setMinutes(now.getMinutes() + 15); // минимум через 15 минут

  // дата — сегодня..+14 дней
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(minDate.getDate() + 14);

  dateEl.min = fmtDate(minDate);
  dateEl.max = fmtDate(maxDate);

  // если сегодня — ограничиваем время
  const todayStr = fmtDate(new Date());
  dateEl.addEventListener('change', () => {
    if (dateEl.value === todayStr) {
      timeEl.min = fmtTime(now);
    } else {
      timeEl.min = '00:00';
    }
  });

  // поставить значения по умолчанию
  dateEl.value = fmtDate(now);
  timeEl.value = fmtTime(now);
  timeEl.min   = fmtTime(now);
}

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function fmtTime(d) {
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  return `${hh}:${mm}`;
}

function getCurrencySym() {
  // упрощённо: «сом»; при необходимости можно подтягивать из i18n/store
  return 'сом';
}

/** отправка */
function onSubmit(e) {
  e.preventDefault();
  const fd = new FormData(form);
  const when = fd.get('when');

  // простая валидация
  const fio = (fd.get('fio')||'').trim();
  const phone = (fd.get('phone')||'').trim();

  resetErrors();
  let ok = true;

  if (!fio) { setError('fio', 'Введите имя'); ok = false; }
  if (!/^\+?\d[\d\-\s()]{7,}$/.test(phone)) { setError('phone', 'Неверный телефон'); ok = false; }

  if (when === 'plan') {
    const d = fd.get('planDate');
    const t = fd.get('planTime');
    if (!d || !t) {
      toast('Выберите дату и время');
      ok = false;
    }
  }

  if (!ok) return;

  // Здесь — место, где будем подключать оплату/бота/бэкенд
  // Пока просто покажу тост и очищу корзину при успехе.
  toast('Заказ подтверждён! Переходим к оплате...');
  // TODO: redirect на платеж/или вызвать ваш модуль оплаты
}
function resetErrors() {
  form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
}
function setError(field, text) {
  const el = form.querySelector(`.form-error[data-for="${field}"]`);
  if (el) el.textContent = text;
}
