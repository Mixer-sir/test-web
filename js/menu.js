// assets/js/menu.js
import { t, setLang, getLang, onLangChange } from './i18n.js';
import { addItem, changeQty, getCart, getQty, saveCart, onCartChange, getCurrencySymbol } from './store.js';
import { toast } from './ui.js';

const grid = document.getElementById('menu-grid');
const catBar = document.querySelector('.menu__categories');
const searchInput = document.getElementById('search-input');
const filterChips = document.querySelectorAll('.menu__filters input[type="checkbox"]');

let items = [];             // будет загружаться из API/JSON/локально
let filtered = [];
let currentCat = 'all';

(async function init() {
  // 1) загрузка меню (заглушка)
  items = await loadMenu();
  renderList(items);

  // 2) категории
  catBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;
    catBar.querySelectorAll('.category-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    currentCat = btn.dataset.category || 'all';
    applyFilters();
  });

  // активируем "ВСЕ" по умолчанию
  const first = catBar.querySelector('.category-btn[data-category="all"]') || catBar.querySelector('.category-btn');
  if (first) first.classList.add('is-active');

  // 3) поиск
  searchInput?.addEventListener('input', applyFilters);

  // 4) фильтры (хит/острое/вег/наличие)
  filterChips.forEach(ch => ch.addEventListener('change', applyFilters));

  // 5) мультиязык
  onLangChange(() => {
    renderList(filtered.length ? filtered : items);
  });
})();

async function loadMenu() {
  // Здесь можно дергать backend. Пока — демо-список.
  return [
    { id: '1', name: { ru: 'Шаурма классическая', en: 'Classic Shawarma', ky: 'Классикалык шаверма' }, desc: { ru: 'Курица, соус, овощи', en: 'Chicken, sauce, veggies', ky: 'Товук, соус, жашылча' }, price: 220, cat: 'shawarma', tags: ['hit'], available: true },
    { id: '2', name: { ru: 'Шаурма острая', en: 'Spicy Shawarma', ky: 'Ачуу шаверма' }, desc: { ru: 'Перец, специи', en: 'Chili, spices', ky: 'Кочкул, татымдар' }, price: 240, cat: 'shawarma', tags: ['spicy'], available: true },
    { id: '3', name: { ru: 'Салат овощной', en: 'Veggie Salad', ky: 'Жашылча салаты' }, desc: { ru: 'Огурцы, помидоры', en: 'Cucumbers, tomatoes', ky: 'Бадыркан, помидор' }, price: 150, cat: 'salad', tags: ['veg'], available: true },
  ];
}

function applyFilters() {
  const q = (searchInput?.value || '').trim().toLowerCase();
  const flags = {
    available: document.querySelector('[data-filter="available"]')?.checked,
    veg: document.querySelector('[data-filter="veg"]')?.checked,
    spicy: document.querySelector('[data-filter="spicy"]')?.checked,
    hit: document.querySelector('[data-filter="hit"]')?.checked,
  };

  filtered = items.filter(it => {
    if (currentCat !== 'all' && it.cat !== currentCat) return false;
    if (q && !String(tName(it)).toLowerCase().includes(q)) return false;
    if (flags.available && !it.available) return false;
    if (flags.veg && !it.tags?.includes('veg')) return false;
    if (flags.spicy && !it.tags?.includes('spicy')) return false;
    if (flags.hit && !it.tags?.includes('hit')) return false;
    return true;
  });

  renderList(filtered);
}

function renderList(list) {
  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML = `<div class="muted" style="padding:20px">${t('menu.empty', 'Ничего не найдено')}</div>`;
    return;
  }
  const cur = getLang();
  list.forEach(it => {
    const html = createCard(it, cur);
    grid.insertAdjacentHTML('beforeend', html);
  });

  // навесим обработчики
  grid.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', onAdd);
  });
  grid.querySelectorAll('.qbtn').forEach(b => b.addEventListener('click', onStep));
}

function tName(it) { return it.name?.[getLang()] || it.name?.ru || '' }
function tDesc(it) { return it.desc?.[getLang()] || it.desc?.ru || '' }

function createCard(it, lang) {
  const qty = getQty(it.id);
  const cur = getCurrencySymbol(lang); // "сом" / "c" на узких мы поправим CSS-ом
  return `
  <article class="card menu-card" data-id="${it.id}">
    <div class="card__media-wrapper">
      <img class="card__media" src="${it.image || 'assets/img/placeholder.jpg'}" alt="">
      ${it.tags?.includes('hit') ? `<div class="card__badges"><span class="card__badge card__badge--hit">🔥 ${t('tags.hit', 'Хит')}</span></div>` : ''}
      ${!it.available ? `<div class="card__overlay"><div class="card__overlay-text">${t('menu.soldout', 'Нет в наличии')}</div></div>` : ''}
    </div>
    <div class="card__body">
      <h3 class="card__title">${tName(it)}</h3>
      <p class="card__desc">${tDesc(it)}</p>
      <div class="menu-card__footer">
        <div class="price"><span class="value">${it.price}</span> <span class="currency">сом</span></div>
        ${qty > 0
      ? `<div class="qty-control">
                 <button class="qbtn dec" data-id="${it.id}">−</button>
                 <span class="qvalue" data-id="${it.id}">${qty}</span>
                 <button class="qbtn inc" data-id="${it.id}">+</button>
               </div>`
      : `<button class="btn-add" data-id="${it.id}">${t('btn.add', 'Добавить')}</button>`
    }
      </div>
    </div>
  </article>`;
}

function onAdd(e) {
  const id = e.currentTarget.dataset.id;
  addItem(id, 1);
  toast(t('toast.added', 'Добавлено в корзину'));
  // перерисуем карточку аккуратно
  const item = (items.find(x => x.id === id) || filtered.find(x => x.id === id));
  const card = e.currentTarget.closest('.menu-card');
  card.outerHTML = createCard(item, getLang());
  // перевесим обработчики на новую ноду
  renderList(filtered.length ? filtered : items);
}

function onStep(e) {
  const id = e.currentTarget.dataset.id;
  const inc = e.currentTarget.classList.contains('inc');
  const dec = e.currentTarget.classList.contains('dec');
  if (inc) changeQty(id, +1);
  if (dec) changeQty(id, -1);
  // find qty span
  const qEl = grid.querySelector(`.qvalue[data-id="${id}"]`);
  const v = getQty(id);
  if (qEl) qEl.textContent = v;
  if (v <= 0) {
    // заменить степпер на кнопку
    const card = grid.querySelector(`.menu-card[data-id="${id}"]`);
    const btnWrap = card.querySelector('.menu-card__footer');
    btnWrap.querySelector('.qty-control')?.remove();
    btnWrap.insertAdjacentHTML('beforeend', `<button class="btn-add" data-id="${id}">${t('btn.add', 'Добавить')}</button>`);
    btnWrap.querySelector('.btn-add').addEventListener('click', onAdd);
  }
}
