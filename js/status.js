// assets/js/status.js
import { t, apply } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  apply(); // подтянуть переводы

  const params = new URLSearchParams(window.location.search);
  const ok = params.get('ok') === '1';
  const err = params.get('error') || '';

  const titleEl = document.getElementById('status-title');
  const descEl = document.getElementById('status-desc');
  const btnEl = document.getElementById('status-btn');

  // Можно хранить последние данные о заказе (например, order_id) в sessionStorage
  const orderId = sessionStorage.getItem('last_order_id'); // если ты его туда кладёшь на checkout

  if (ok) {
    titleEl.textContent = t('status.success.title', 'Заказ оформлен!');
    descEl.textContent = orderId
      ? t('status.success.descWithId', `Ваш заказ №${orderId} принят. Мы уже начали готовить.`)
      : t('status.success.desc', 'Ваш заказ принят. Мы уже начали готовить.');

    btnEl.textContent = t('status.success.btn', 'Вернуться в меню');
    btnEl.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  } else {
    titleEl.textContent = t('status.fail.title', 'Оплата не прошла');
    descEl.textContent = err
      ? t('status.fail.descWithReason', `Причина: ${err}`)
      : t('status.fail.desc', 'К сожалению, что-то пошло не так. Попробуйте ещё раз.');

    btnEl.textContent = t('status.fail.btn', 'Вернуться в корзину');
    btnEl.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }
});
