// assets/js/checkout.js
// Без импортов — используем window.Store и i18n.apply/t

(function () {
  const $ = (sel, p = document) => p.querySelector(sel);

  document.addEventListener('DOMContentLoaded', () => {
    // 1) Переводы
    try { if (window.apply) window.apply(); } catch (e) { }

    // 2) Рендер итога
    renderTotal();

    // 3) Выбор «когда»
    const asapRadio = $('#when-asap');
    const planRadio = $('#when-plan');
    const planTime = $('#plan-time');

    if (asapRadio && planRadio && planTime) {
      asapRadio.addEventListener('change', () => {
        planTime.disabled = true;
      });
      planRadio.addEventListener('change', () => {
        planTime.disabled = false;
        // Минимум через 15 минут
        const d = new Date(Date.now() + 15 * 60e3);
        planTime.value = d.toISOString().slice(0, 16); // yyyy-mm-ddThh:mm
        planTime.min = planTime.value;
      });
    }

    // 4) Сабмит
    const form = $('#checkout-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = $('#inp-name').value.trim();
      const phone = $('#inp-phone').value.trim();
      const comment = $('#inp-comment').value.trim();
      const isPlan = planRadio?.checked;
      const whenTs = isPlan ? planTime.value : null;

      const items = (window.Store && window.Store.all()) || [];
      if (!items.length) {
        showToast((window.t && window.t('toast.emptyCart')) || 'Корзина пуста', 'err');
        return;
      }

      if (!name || !phone) {
        showToast('Введите имя и телефон', 'err');
        return;
      }

      const orderPayload = {
        customer: { name, phone },
        comment,
        when: isPlan ? whenTs : 'asap',
        items,
        total: window.Store ? window.Store.total() : 0
      };

      try {
        // 5) Здесь — заглушка оплаты:
        await payStub(orderPayload);

        // например, сохраняем «id» в sessionStorage — пригодится для status
        const id = 'ORD-' + Date.now().toString().slice(-6);
        sessionStorage.setItem('last_order_id', id);

        // 6) Редирект на статус
        location.href = 'status.html?ok=1';
      } catch (err) {
        console.error(err);
        showToast((window.t && window.t('toast.payError')) || 'Оплата не прошла', 'err');
        location.href = 'status.html?ok=0&error=declined';
      }
    });

    // Пересчитывать итого при изменениях корзины
    window.addEventListener('cart:updated', renderTotal);
  });

  function renderTotal() {
    const el = document.getElementById('checkout-total');
    if (!el) return;
    const sum = window.Store ? window.Store.total() : 0;

    // для мобильной — можно вынести «сом» -> «с»
    const isMobile = matchMedia('(max-width: 480px)').matches;
    const suffix = isMobile
      ? ((window.t && window.t('money.somShort')) || 'с')
      : ((window.t && window.t('money.somFull')) || 'сом');

    el.textContent = `${sum} ${suffix}`;
  }

  // Простая заглушка оплаты
  function payStub(payload) {
    return new Promise((resolve) => setTimeout(resolve, 900));
  }

  function showToast(msg, type = 'ok') {
    const wrap = document.getElementById('toast-container');
    if (!wrap) return alert(msg);
    const node = document.createElement('div');
    node.className = 'toast ' + (type === 'err' ? 'toast--err' : 'toast--ok');
    node.textContent = msg;
    wrap.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }
})();

import { getSummary, onCartChange } from './store.js';

function updateSummary() {
  const { total } = getSummary();
  const el = document.getElementById('cart-total');
  if (el) el.textContent = total;
}
// пересчитывать при изменениях
onCartChange(updateSummary);
// и сразу при загрузке
updateSummary();

const asapRadio  = document.getElementById('when-asap');
const planRadio  = document.getElementById('when-plan');
const planWrap   = document.getElementById('plan-fields');
const planDate   = document.getElementById('plan-date');
const planTime   = document.getElementById('plan-time');

function fmtDate(d) { return d.toISOString().slice(0,10); }
function pad2(n){ return n<10 ? '0'+n : ''+n; }

function setPlanConstraints() {
  const now = new Date();
  const min15 = new Date(now.getTime() + 15 * 60 * 1000);   // +15 минут
  const max14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 дней

  planDate.min = fmtDate(now);
  planDate.max = fmtDate(max14);

  // Если дата сегодня — время не меньше, чем через 15 минут
  const chosen = planDate.value ? new Date(planDate.value + 'T00:00:00') : now;
  if (fmtDate(chosen) === fmtDate(now)) {
    planTime.min = `${pad2(min15.getHours())}:${pad2(min15.getMinutes())}`;
  } else {
    planTime.min = '00:00';
  }
}

function applyWhenUI(){
  if (planRadio.checked) {
    planWrap.style.display = 'flex';
    setPlanConstraints();
  } else {
    planWrap.style.display = 'none';
    planDate.value = '';
    planTime.value = '';
  }
}
asapRadio?.addEventListener('change', applyWhenUI);
planRadio?.addEventListener('change', applyWhenUI);
planDate?.addEventListener('change', setPlanConstraints);
applyWhenUI();

function renderEmptyCart(){
  const list = document.getElementById('cart-list');
  list.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">🛒</div>
      <div class="empty-state__text">${t('cart.empty','В корзине пусто')}</div>
      <a href="index.html" class="btn btn--primary">${t('cart.go_back','Вернуться в меню')}</a>
    </div>`;
}
