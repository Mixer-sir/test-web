// assets/js/cart.js
import { getCart, changeQty, clearCart, getQty, getCount } from './store.js';
import { t } from './i18n.js';
import { toast } from './ui.js';

const list = document.getElementById('cart-list');
const totalEl = document.getElementById('cart-total');

const db = {
  // тут должна быть база по товарам — в реальном проекте подтягиваешь по id
  '1': { id: '1', name: 'Шаурма классическая', price: 220 },
  '2': { id: '2', name: 'Шаурма острая', price: 240 },
  '3': { id: '3', name: 'Салат овощной', price: 150 },
};

render();

function render() {
  const cart = getCart();
  const ids = Object.keys(cart);
  if (!ids.length) {
    list.innerHTML = `<div class="muted" style="padding:20px">${t('menu.empty', 'Пусто')}</div>`;
    totalEl.textContent = '0 сом';
    return;
  }
  let total = 0;
  list.innerHTML = '';
  ids.forEach(id => {
    const qty = cart[id]?.qty || 0;
    const item = db[id] || { name: `#${id}`, price: 0 };
    const sum = item.price * qty; total += sum;
    list.insertAdjacentHTML('beforeend', `
      <div class="cart-item" data-id="${id}">
        <div class="cart-item__body">
          <div>${item.name}</div>
          <div class="qty"><button class="icon-btn dec">−</button><span>${qty}</span><button class="icon-btn inc">+</button></div>
          <div class="price-badge">${sum} сом</div>
        </div>
      </div>`);
  });
  totalEl.textContent = `${total} сом`;

  list.querySelectorAll('.inc').forEach(b => b.addEventListener('click', e => {
    const id = e.target.closest('.cart-item').dataset.id; changeQty(id, +1); render();
  }));
  list.querySelectorAll('.dec').forEach(b => b.addEventListener('click', e => {
    const id = e.target.closest('.cart-item').dataset.id; changeQty(id, -1); render();
  }));
}
