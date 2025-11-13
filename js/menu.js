// js/menu.js
import { t, getLang, onLangChange } from './i18n.js';
import { getCatalog, addItem, changeQty, getQty, getCurrencySymbol, canAdd } from './store.js';
import { toast } from './ui.js';

const grid = document.querySelector('#menu-grid');
const catBar = document.querySelector('.menu__categories');
const searchInput = document.querySelector('#search-input');
const filterContainer = document.querySelector('.menu__filters');

let ALL_ITEMS = [];
let currentCat = 'all';

init();

async function init() {
  try {
    ALL_ITEMS = getCatalog();
    if (!Array.isArray(ALL_ITEMS) || !ALL_ITEMS.length) {
      console.warn('Catalog is empty from store.js — using fallback demo');
      ALL_ITEMS = [
        { id: '1', name: { ru: 'Шаурма классическая' }, desc: { ru: 'Курица, соус, овощи' }, price: 220, cat: 'shawarma', tags: ['hit'], available: true, image: 'assets/img/shawarma1.jpg' },
        { id: '2', name: { ru: 'Шаурма острая' }, desc: { ru: 'Перец, специи' }, price: 240, cat: 'shawarma', tags: ['spicy'], available: true, image: 'assets/img/shawarma2.jpg' },
        { id: '3', name: { ru: 'Салат овощной' }, desc: { ru: 'Огурцы, помидоры' }, price: 150, cat: 'salad', tags: ['veg'], available: true, image: 'assets/img/salad1.jpg' },
      ];
    }
    bindUI();
    renderList(ALL_ITEMS);
  } catch (e) {
    console.error('menu init failed', e);
    grid.innerHTML = `<div class="muted" style="padding:20px">${t('menu.empty','Ничего не найдено')}</div>`;
  }
}

function bindUI() {
  catBar?.addEventListener('click', onCatClick);
  searchInput?.addEventListener('input', applyFilters);
  filterContainer?.addEventListener('change', applyFilters);

  // Активируем "ВСЕ" по умолчанию
  const first = catBar?.querySelector('[data-category="all"]') || catBar?.querySelector('.category-btn');
  if (first) { first.classList.add('is-active'); currentCat = first.dataset.category || 'all'; }

  onLangChange(() => renderList(getActiveList()));
}

function onCatClick(e) {
  const btn = e.target.closest('.category-btn');
  if (!btn) return;
  catBar.querySelectorAll('.category-btn').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  currentCat = btn.dataset.category || 'all';
  applyFilters();
}

function getActiveList() {
  const q = (searchInput?.value || '').toLowerCase().trim();
  const flags = {
    available: document.querySelector('[data-filter="available"]')?.checked,
    veg:       document.querySelector('[data-filter="veg"]')?.checked,
    spicy:     document.querySelector('[data-filter="spicy"]')?.checked,
    hit:       document.querySelector('[data-filter="hit"]')?.checked,
  };

  return ALL_ITEMS.filter(x => {
    if (currentCat !== 'all' && x.cat !== currentCat) return false;
    if (q && !(tName(x)).toLowerCase().includes(q)) return false;
    if (flags.available && !x.available) return false;
    if (flags.veg && !x.tags?.includes('veg')) return false;
    if (flags.spicy && !x.tags?.includes('spicy')) return false;
    if (flags.hit && !x.tags?.includes('hit')) return false;
    return true;
  });
}

function applyFilters() {
  renderList(getActiveList());
}

function renderList(list) {
  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML = `<div class="muted" style="padding:20px">${t('menu.empty', 'Ничего не найдено')}</div>`;
      // Внутри цикла по товарам (list.forEach...), когда формируешь HTML карточки:
  const available = it.available === true;
  const actionHtml = available
    ? (getQty(it.id) > 0
      ? `<div class="qty-control">
          <button class="qbtn dec" data-id="${it.id}">−</button>
          <span class="qvalue" data-id="${it.id}">${getQty(it.id)}</span>
          <button class="qbtn inc" data-id="${it.id}">+</button>
        </div>`
      : `<button class="btn-add" data-id="${it.id}">${t('btn.add','Добавить')}</button>`)
    : `<button class="btn-add" disabled title="${t('menu.soldout','Нет в наличии')}">${t('menu.soldout','Нет в наличии')}</button>`;

  card.innerHTML = `
    <div class="card__media-wrapper">
      <img class="card__media" src="${it.image || 'assets/img/placeholder.jpg'}" alt="">
      ${it.tags?.includes('hit') ? `<div class="card__badges"><span class="card__badge card__badge--hit">🔥 ${t('tags.hit','Хит')}</span></div>` : ''}
      ${!available ? `<div class="card__overlay"><div class="card__overlay-text">${t('menu.soldout','Нет в наличии')}</div></div>` : ''}
    </div>
    <div class="card__body">
      <h3 class="card__title">${tName(it)}</h3>
      ${tDesc(it) ? `<p class="card__desc">${tDesc(it)}</p>` : ''}
      <div class="menu-card__footer">
        <div class="price"><span class="value">${it.price}</span> <span class="currency">сом</span></div>
        ${actionHtml}
      </div>
    </div>`;

    return;
  }

  const lang = getLang();
  const frag = document.createDocumentFragment();

  list.forEach(it => {
    const card = document.createElement('article');
    card.className = 'card menu-card';
    card.dataset.id = it.id;
    card.innerHTML = `
      <div class="card__media-wrapper">
        <img class="card__media" src="${it.image || 'assets/img/placeholder.jpg'}" alt="">
        ${it.tags?.includes('hit')   ? `<div class="card__badges"><span class="card__badge card__badge--hit">🔥 ${t('tags.hit','Хит')}</span></div>` : ''}
        ${!it.available              ? `<div class="card__overlay"><div class="card__overlay-text">${t('menu.soldout','Нет в наличии')}</div></div>` : ''}
      </div>
      <div class="card__body">
        <h3 class="card__title">${tName(it)}</h3>
        ${tDesc(it) ? `<p class="card__desc">${tDesc(it)}</p>` : ``}
        <div class="menu-card__footer">
            <div class="price"><span class="value">${it.price}</span> <span class="currency">сом</span></div>
            ${renderAction(it.id)}
        </div>
      </div>`;
    frag.appendChild(card);
  });
  grid.appendChild(frag);

  grid.querySelectorAll('.btn-add').forEach(b => b.addEventListener('click', onAdd));
  grid.querySelectorAll('.qbtn').forEach(b => b.addEventListener('click', onStep));
}

function renderAction(id) {
  const q = getQty(id);
  return q > 0
    ? `<div class="qty-control">
         <button class="qbtn dec" data-id="${id}">−</button>
         <span class="qvalue" data-id="${id}">${q}</span>
         <button class="qbtn inc" data-id="${id}">+</button>
       </div>`
    : `<button class="btn-add" data-id="${id}">${t('btn.add','Добавить')}</button>`;
}

function onAdd(e) {
  const id = e.currentTarget.dataset.id;
  addItem(id, 1);
  toast(t('toast.added', 'Добавлено в корзину'));
  applyFilters();
}

function onStep(e) {
  const id = e.currentTarget.dataset.id;
  if (e.currentTarget.classList.contains('inc')) changeQty(id, 1);
  else changeQty(id, -1);
  applyFilters();
}

function tName(it) { return it.name?.[getLang()] || it.name?.ru || ''; }
function tDesc(it) { return it.desc?.[getLang()] || it.desc?.ru || ''; }

function onAdd(e) {
  const id = e.currentTarget.dataset.id;
  if (!canAdd(id)) {
    toast(t('menu.soldout', 'Нет в наличии'));
    return;
  }
  addItem(id, 1);
  toast(t('toast.added', 'Добавлено в корзину'));
  applyFilters(); // просто перерендерим список
}