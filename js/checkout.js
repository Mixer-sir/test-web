// checkout.js — рендер корзины и оформление
import { getSummary, changeQty, removeItem, clear, onCartChange } from './store.js';

const listEl = document.getElementById('cart-list');
const totalEl = document.getElementById('cart-total');
const formEl  = document.getElementById('order-form');
const asapEl  = document.getElementById('when-asap');
const planEl  = document.getElementById('when-plan');
const planBox = document.getElementById('plan-fields');
const planDate = document.getElementById('plan-date');
const planTime = document.getElementById('plan-time');
const submitBtn = document.getElementById('btn-submit');

init();

function init(){
  setupPlanControls();
  onCartChange(render);
  render();
  formEl?.addEventListener('submit', onSubmit);

  setupPhoneMask();
}

function setupPlanControls(){
  asapEl?.addEventListener('change', togglePlan);
  planEl?.addEventListener('change', togglePlan);
  togglePlan();
  // лимиты даты/времени
  const now = new Date();
  const max = new Date(now.getTime() + 14*24*60*60*1000);
  if (planDate){
    planDate.min = now.toISOString().slice(0,10);
    planDate.max = max.toISOString().slice(0,10);
  }
}

function togglePlan(){
  const planned = planEl?.checked;
  if (!planBox) return;
  planBox.style.display = planned ? '' : 'none';
  if (planned){
    const now = new Date(Date.now() + 15*60*1000); // +15 минут
    if (planDate && !planDate.value) planDate.value = now.toISOString().slice(0,10);
    if (planTime && !planTime.value) planTime.value = now.toTimeString().slice(0,5);
  }
}

function render(){
  const { rows, total } = getSummary();
  // total
  if (totalEl) totalEl.textContent = total.toString();

  // список
  if (!listEl) return;
  if (!rows.length){
    submitBtn?.setAttribute('disabled','disabled');
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🛒</div>
        <div class="empty-state__text">В корзине пусто</div>
      </div>`;
    return;
  }
  submitBtn?.removeAttribute('disabled');

  listEl.innerHTML = rows.map(r => `
    <div class="cart-item" data-id="${r.item.id}">
      <div class="cart-item__body">
        <div>
          <div class="fw-700">${r.item.name?.ru || ''}</div>
          <div class="muted">${r.item.price} сом · ${r.item.cat}</div>
        </div>
        <div class="qty">
          <button class="qbtn dec" data-id="${r.item.id}" aria-label="−">−</button>
          <span>${r.qty}</span>
          <button class="qbtn inc" data-id="${r.item.id}" aria-label="+">+</button>
        </div>
        <div class="price-badge">${r.sum} сом</div>
        <button class="qbtn icon-btn--danger rm" data-id="${r.item.id}" aria-label="Удалить">×</button>
      </div>
    </div>
  `).join('');

  // события
  listEl.querySelectorAll('.inc').forEach(b => b.addEventListener('click', e => changeQty(e.currentTarget.dataset.id, +1)));
  listEl.querySelectorAll('.dec').forEach(b => b.addEventListener('click', e => changeQty(e.currentTarget.dataset.id, -1)));
  listEl.querySelectorAll('.rm').forEach(b => b.addEventListener('click', e => removeItem(e.currentTarget.dataset.id)));
}

function onSubmit(e){
  e.preventDefault();
  const { rows, total } = getSummary();
  if (!rows.length) return;

  const data = new FormData(formEl);
  const payload = {
    name: data.get('name')?.toString().trim(),
    phone: data.get('phone')?.toString().trim(),
    comment: data.get('comment')?.toString().trim(),
    when: asapEl?.checked ? 'asap' : 'plan',
    plan_date: planEl?.checked ? planDate?.value : null,
    plan_time: planEl?.checked ? planTime?.value : null,
    items: rows.map(r => ({ id: r.item.id, qty: r.qty, price: r.price })),
    total
  };

  // TODO: тут будет интеграция оплаты; пока просто лог и очистка
  console.log('ORDER', payload);
  clear(); // корзину очищаем
  render();

  // навигация на статус
  window.location.href = 'status.html';
}

/* ================================================= */
/* ============= БЛОК МАСКИ ДЛЯ ТЕЛЕФОНА ============ */
/* ================================================= */

/**
 * Находит поле телефона и "вешает" на него обработчик
 */
function setupPhoneMask() {
  // Находим поле телефона по его ID из HTML
  const phoneInput = document.getElementById('phone');
  
  if (phoneInput) {
    // Добавляем слушатель события 'input'
    // 'input' срабатывает на любое изменение (ввод, вставка, удаление)
    phoneInput.addEventListener('input', handlePhoneInput);
  }
}

/**
 * Функция, которая форматирует номер при каждом вводе
 * @param {Event} e - событие 'input'
 */
function handlePhoneInput(e) {
  const input = e.target;
  
  // 1. Очищаем значение от всего, кроме цифр
  let value = input.value.replace(/\D/g, ''); 

  // 2. Ограничиваем длину 12-ю цифрами (996 + 9 цифр номера)
  value = value.substring(0, 12);

  // 3. Применяем форматирование
  let formatted = '';
  
  // +996
  if (value.length > 0) {
    formatted = '+' + value.substring(0, 3);
  }
  // +996 (555
  if (value.length > 3) {
    formatted += ' (' + value.substring(3, 6) + ')';
  }
  // +996 (555) 12
  if (value.length > 6) {
    formatted += ' ' + value.substring(6, 8);
  }
  // +996 (555) 12-34
  if (value.length > 8) {
    formatted += '-' + value.substring(8, 10);
  }
  // +996 (555) 12-34-56
  if (value.length > 10) {
    formatted += '-' + value.substring(10, 12);
  }
  
  // 4. Устанавливаем отформатированное значение обратно в поле
  input.value = formatted;
}

/* ================== КОНЕЦ БЛОКА МАСКИ ================== */