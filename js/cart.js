// js/cart.js
import { t, getLang } from './i18n.js';
import { getCart, changeQty, getCurrencySymbol } from './store.js';
import { toast } from './ui.js';

const listEl  = document.getElementById('cart-list');
const sumEl   = document.getElementById('summary-sum');

const form    = document.getElementById('order-form');
const planBox = document.getElementById('plan-controls');
const dateEl  = document.getElementById('plan-date');
const timeEl  = document.getElementById('plan-time');

init();

function init() {
  // 1) нарисовать корзину
  renderCart();

  // 2) переключение "как можно быстрее / запланировать"
  if (form) {
    form.querySelectorAll('input[name="when"]').forEach(r => {
      r.addEventListener('change', onWhenChange);
    });

    form.addEventListener('submit', onSubmit);
  }

  // 3) подготовить лимиты для планирования (дата/время)
  preparePlanLimits();
}

/* ===================== РЕНДЕР КОРЗИНЫ ===================== */

function renderCart() {
  const { items } = getCart();         // [{ pr, qty }]
  const cur       = getCurrencySymbol(); // "сом" / "c"
  let total       = 0;

  listEl.innerHTML = '';

  // если пусто — сразу показываем "В корзине пусто"
  if (!items.length) {
    listEl.innerHTML = `
      <li class="empty-state">
        <div class="empty-state__icon">🛒</div>
        <div class="empty-state__text">
          ${t('cart.empty', 'В корзине пусто')}
        </div>
      </li>`;
    sumEl.textContent = '0';
    return;
  }

  items.forEach(({ pr, qty }) => {
    if (!pr) return;

    total += pr.price * qty;

    const name =
      pr.name?.[getLang()] || pr.name?.ru || pr.name || 'Без названия';
    const desc =
      pr.desc?.[getLang()] || pr.desc?.ru || pr.desc || '';

    const row = `
      <li class="cart-row" data-id="${pr.id}">
        <img class="cart-row__img" src="${pr.image || 'assets/img/placeholder.jpg'}" alt="">

        <div class="cart-row__info">
          <div class="cart-row__title">${name}</div>
          ${desc ? `<p class="cart-row__desc">${desc}</p>` : ''}
        </div>

        <div class="qty">
          <button class="qbtn dec" aria-label="${t('cart.dec', 'Уменьшить')}" data-id="${pr.id}">−</button>
          <span class="qvalue" data-id="${pr.id}">${qty}</span>
          <button class="qbtn inc" aria-label="${t('cart.inc', 'Увеличить')}" data-id="${pr.id}">+</button>
        </div>

        <div class="cart-row__price">
          ${pr.price * qty} <span class="currency">${cur}</span>
        </div>
      </li>`;
    listEl.insertAdjacentHTML('beforeend', row);
  });

  // итоговая сумма
  sumEl.textContent = total;

  // переназначаем обработчики степперов
  listEl
    .querySelectorAll('.qbtn')
    .forEach(b => b.addEventListener('click', onStep));
}

/* изменение количества в корзине */
function onStep(e) {
  const id   = e.currentTarget.dataset.id;
  const inc  = e.currentTarget.classList.contains('inc');
  const diff = inc ? 1 : -1;

  changeQty(id, diff);
  renderCart();
}

/* ===================== ПЛАНИРОВАНИЕ ЗАКАЗА ===================== */

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

  const todayStr = fmtDate(new Date());

  // актуализируем min для времени
  dateEl.onchange = () => {
    if (dateEl.value === todayStr) {
      timeEl.min = fmtTime(now);
    } else {
      timeEl.min = '00:00';
    }
  };

  // значения по умолчанию
  dateEl.value = fmtDate(now);
  timeEl.value = fmtTime(now);
  timeEl.min   = fmtTime(now);
}

function fmtDate(d) {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fmtTime(d) {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/* ===================== ОТПРАВКА ФОРМЫ ===================== */

function onSubmit(e) {
  e.preventDefault();
  const fd   = new FormData(form);
  const when = fd.get('when');

  const fio   = (fd.get('fio')   || '').trim();
  const phone = (fd.get('phone') || '').trim();

  resetErrors();
  let ok = true;

  if (!fio) {
    setError('fio', 'Введите имя');
    ok = false;
  }
  if (!/^\+?\d[\d\-\s()]{7,}$/.test(phone)) {
    setError('phone', 'Неверный телефон');
    ok = false;
  }

  if (when === 'plan') {
    const d = fd.get('planDate');
    const t = fd.get('planTime');
    if (!d || !t) {
      toast('Выберите дату и время');
      ok = false;
    }
  }

  if (!ok) return;

  // Здесь потом будет подключаться реальная оплата
  toast('Заказ подтверждён! Переходим к оплате...');
}

function resetErrors() {
  form.querySelectorAll('.form-error').forEach(el => (el.textContent = ''));
}
function setError(field, text) {
  const el = form.querySelector(`.form-error[data-for="${field}"]`);
  if (el) el.textContent = text;
}
