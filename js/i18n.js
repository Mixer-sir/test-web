// assets/js/i18n.js
let lang = localStorage.getItem('lang') || 'ru';
const subs = [];

export function getLang() { return lang }
export function setLang(l) {
  lang = l; localStorage.setItem('lang', l);
  apply(); subs.forEach(fn => fn(lang));
}
export function onLangChange(cb) { subs.push(cb) }
export function t(key, fallback = '') {
  return dict[lang]?.[key] ?? fallback;
}
export function apply() {
  document.querySelectorAll('[data-i18n]').forEach(node => {
    const key = node.getAttribute('data-i18n');
    if (key) node.textContent = t(key, node.textContent);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(node => {
    const key = node.getAttribute('data-i18n-placeholder');
    node.setAttribute('placeholder', t(key, node.getAttribute('placeholder') || ''));
  });
}

// простой локальный словарь; можешь вынести в /i18n/ru.json и грузить fetch’ем
const dict = {
    ru: {
      status: {
        title: 'Статус заказа',
        success: {
          title: 'Заказ оформлен!',
          desc: 'Ваш заказ принят. Мы уже начали готовить.',
          descWithId: 'Ваш заказ №{{id}} принят. Мы уже начали готовить.',
          btn: 'Вернуться в меню'
        },
        fail: {
          title: 'Оплата не прошла',
          desc: 'К сожалению, что-то пошло не так. Попробуйте ещё раз.',
          descWithReason: 'К сожалению, оплата не прошла. Причина: {{reason}}',
          btn: 'Вернуться в корзину'
        }
      },
      checkout: {
        title: 'Оформление заказа',
        name: 'Имя',
        phone: 'Телефон',
        comment: 'Комментарий',
        when: 'Когда приготовить',
        asap: 'Как можно быстрее',
        plan: 'Запланировать',
        submit: 'Оформить заказ',
        total: 'Итого'
      },
      toast: {
        added: 'Добавлено в корзину',
        emptyCart: 'Корзина пуста',
        orderCreated: 'Заказ создан',
        payError: 'Оплата не прошла'
      },
      money: {
        somShort: 'с',
        somFull: 'сом'
      }
    },
  
    en: {
      status: {
        title: 'Order status',
        success: {
          title: 'Order placed!',
          desc: 'We have started cooking your order.',
          descWithId: 'Your order #{{id}} is accepted.',
          btn: 'Back to menu'
        },
        fail: {
          title: 'Payment failed',
          desc: 'Something went wrong. Please try again.',
          descWithReason: 'Payment failed. Reason: {{reason}}',
          btn: 'Back to cart'
        }
      },
      checkout: {
        title: 'Checkout',
        name: 'Name',
        phone: 'Phone',
        comment: 'Comment',
        when: 'When to cook',
        asap: 'ASAP',
        plan: 'Schedule',
        submit: 'Place order',
        total: 'Total'
      },
      toast: {
        added: 'Added to cart',
        emptyCart: 'Cart is empty',
        orderCreated: 'Order created',
        payError: 'Payment failed'
      },
      money: { somShort: 's', somFull: 'som' }
    },
  
    ky: {
      status: {/* ...переводы на кыргызском... */ },
      checkout: {/* ... */ },
      toast: {/* ... */ },
      money: { somShort: 'с', somFull: 'сом' }
    }
};

// авто-инициализация
document.addEventListener('DOMContentLoaded', apply);
