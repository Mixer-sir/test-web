// js/menu.js — каталог и добавление в корзину
import {
  getCatalog,
  addItem,
  changeQty,
  getQty,
  canAdd,
  getCurrencySymbol,
  onCartChange
} from './store.js';

const grid = document.getElementById('menu-grid');
const catBar = document.querySelector('.menu__categories');
const searchInput = document.getElementById('search-input');
const filterChips = document.querySelectorAll('.menu__filters input[type="checkbox"]');

let items = [];
let view = [];
let currentCat = 'all';

init();

function init() {
  items = getCatalog();

  // категории
  catBar?.addEventListener('click', onCatClick);

  // поиск
  searchInput?.addEventListener('input', applyFilters);

  // фильтры
  filterChips.forEach(ch => ch.addEventListener('change', applyFilters));

  // слушаем изменения корзины — перерисовываем только контролы в карточках
  onCartChange(() => rerenderControls());

  // активировать “ВСЕ”
  const first =
    catBar?.querySelector('[data-category="all"]') ||
    catBar?.querySelector('.category-btn');
  first && first.classList.add('is-active');

  applyFilters();
}

function onCatClick(e) {
  const btn = e.target.closest('.category-btn');
  if (!btn) return;
  catBar.querySelectorAll('.category-btn').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  currentCat = btn.dataset.category || 'all';
  applyFilters();
}

function applyFilters() {
  const q = (searchInput?.value || '').trim().toLowerCase();
  const flags = {
    available: document.querySelector('[data-filter="available"]')?.checked,
    veg: document.querySelector('[data-filter="veg"]')?.checked,
    spicy: document.querySelector('[data-filter="spicy"]')?.checked,
    hit: document.querySelector('[data-filter="hit"]')?.checked
  };

  view = items.filter(it => {
    if (currentCat !== 'all' && it.cat !== currentCat) return false;
    if (q && !(it.name?.ru || '').toLowerCase().includes(q)) return false;
    if (flags.available && !it.available) return false;
    if (flags.veg && !it.tags?.includes('veg')) return false;
    if (flags.spicy && !it.tags?.includes('spicy')) return false;
    if (flags.hit && !it.tags?.includes('hit')) return false;
    return true;
  });

  renderList(view);
}

function renderList(list) {
  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML =
      '<div class="muted" style="padding:20px">Ничего не найдено</div>';
    return;
  }

  const cur = getCurrencySymbol();
  const cards = list.map(it => cardHTML(it, cur)).join('');
  grid.insertAdjacentHTML('beforeend', cards);

  // навешиваем события
  grid
    .querySelectorAll('.menu-card__controls .btn-add')
    .forEach(b => b.addEventListener('click', onAdd));
  grid
    .querySelectorAll('.menu-card__controls .qbtn')
    .forEach(b => b.addEventListener('click', onStep));
}

/**
 * Перерисовываем ТОЛЬКО контролы (кнопка/степпер),
 * не трогая цену и остальную верстку карточки.
 */
function rerenderControls() {
  view.forEach(it => {
    const card = grid.querySelector(`.menu-card[data-id="${it.id}"]`);
    if (!card) return;
    const controls = card.querySelector('.menu-card__controls');
    if (!controls) return;

    controls.innerHTML = controlsHTML(it.id);

    controls
      .querySelector('.btn-add')
      ?.addEventListener('click', onAdd);

    controls
      .querySelectorAll('.qbtn')
      .forEach(b => b.addEventListener('click', onStep));
  });
}

function cardHTML(it, cur) {
  return `
    <article class="card menu-card" data-id="${it.id}">
      <div class="card__media-wrapper">
        <img class="card__media" src="${it.image || 'assets/img/placeholder.jpg'}" alt="">
        ${
          it.tags?.includes('hit')
            ? `<div class="card__badges"><span class="card__badge card__badge--hit">🔥 Хит</span></div>`
            : ''
        }
        ${
          !it.available
            ? `<div class="card__overlay"><div class="card__overlay-text">Нет в наличии</div></div>`
            : ''
        }
      </div>
      <div class="card__body">
        <h3 class="card__title">${it.name?.ru || ''}</h3>
        <p class="card__desc">${it.desc?.ru || ''}</p>
        ${footerBlock(it, cur)}
      </div>
    </article>`;
}

/**
 * Футер карточки: слева цена, справа отдельный контейнер с контролами.
 */
function footerBlock(it, cur) {
  return `
    <div class="menu-card__footer">
      <div class="price">
        <span class="value">${it.price}</span>
        <span class="currency">${cur}</span>
      </div>
      <div class="menu-card__controls" data-id="${it.id}">
        ${controlsHTML(it.id)}
      </div>
    </div>`;
}

/**
 * Только блок контролов: либо кнопка "Добавить", либо степпер.
 */
function controlsHTML(id) {
  const qty = getQty(id);

  if (qty > 0) {
    return `
      <div class="qty-control">
        <button class="qbtn dec" data-id="${id}" aria-label="Уменьшить">−</button>
        <span class="qvalue" data-id="${id}">${qty}</span>
        <button class="qbtn inc" data-id="${id}" aria-label="Увеличить">+</button>
      </div>`;
  }

  const disabled = !canAdd(id) ? 'disabled' : '';
  return `<button class="btn btn--primary btn-add" data-id="${id}" ${disabled}>Добавить</button>`;
}

function onAdd(e) {
  const id = e.currentTarget.dataset.id;
  if (!canAdd(id)) return;
  addItem(id, 1);
}

function onStep(e) {
  const id = e.currentTarget.dataset.id;
  if (e.currentTarget.classList.contains('inc')) changeQty(id, +1);
  if (e.currentTarget.classList.contains('dec')) changeQty(id, -1);
}
