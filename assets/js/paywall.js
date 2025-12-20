import { BILLING_PERIODS, PAYMENT_RULES } from './config/billingPeriods.js';

const translations = {
  en: {
    eyebrow: 'Evera AI Hub',
    headline: 'Upgrade to Evera PRO',
    subhead: 'Unlock the full AI library, memory vault, and premium drops inside Evera.',
    free: {
      title: 'Starter Free',
      price: 'Free forever',
      note: 'Stay on the starter tier while you explore the AI Hub.',
      features: ['1 Space + core prompts', 'Limited uploads & saves', 'Community templates access'],
    },
    proTitle: 'Evera PRO',
    mainPrice: (priceUsd, period) => `$${priceUsd} / ${period}`,
    starsLine: (stars) => `≈ ${stars} ⭐ Telegram Stars`,
    cryptoLine: (cryptoUsd) => `TON / USDT: ≈ $${cryptoUsd}  (Save 15%)`,
    cryptoBreakdown: (ton, usdt) => `≈ ${ton} TON • ≈ $${usdt} in USDT`,
    microStars: '⭐ Stars are the easiest checkout.',
    microCrypto: '💎 TON / USDT is cheaper for subscriptions.',
    ctaCrypto: 'Pay with TON / USDT  (Save 15%)',
    ctaStars: 'Pay with Stars',
    footnote: ['Stars = instant Telegram-style payment.', 'TON / USDT = better value for recurring plans.'],
  },
  ru: {
    eyebrow: 'Evera AI Hub',
    headline: 'Апгрейд до Evera PRO',
    subhead: 'Полный AI‑хаб с памятью, библиотекой контента и премиальными дропами.',
    free: {
      title: 'Starter Free',
      price: 'Бесплатно',
      note: 'Оставайтесь на базовом уровне, пока знакомитесь с хабом.',
      features: ['1 пространство + базовые промты', 'Лимитированные загрузки и сохранения', 'Доступ к шаблонам комьюнити'],
    },
    proTitle: 'Evera PRO',
    mainPrice: (priceRub, period) => `${priceRub} ₽ / ${period}`,
    starsLine: (stars) => `≈ ${stars} ⭐ Telegram Stars`,
    cryptoLine: (cryptoUsd) => `TON / USDT: ≈ ${cryptoUsd} $  (−15%)`,
    cryptoBreakdown: (ton, usdt) => `≈ ${ton} TON • ≈ ${usdt} $ в USDT`,
    microStars: '⭐ Stars — самый простой способ (карта / СБП).',
    microCrypto: '💎 TON / USDT — дешевле для подписки.',
    ctaCrypto: 'Оплатить TON / USDT  (−15%)',
    ctaStars: 'Оплатить Stars',
    footnote: ['Stars — оплата в пару кликов, как в Telegram.', 'TON / USDT — выгоднее, если берёшь подписку.'],
  },
};

const formatNumber = (value, language, maximumFractionDigits = 0) =>
  value.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits > 0 ? 2 : 0,
  });

const roundTo = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const getElements = () => {
  const nodes = {
    priceMain: document.querySelector('[data-main-price]'),
    starsLine: document.querySelector('[data-stars-line]'),
    cryptoLine: document.querySelector('[data-crypto-line]'),
    cryptoBreakdown: document.querySelector('[data-crypto-breakdown]'),
    microStars: document.querySelector('[data-micro-stars]'),
    microCrypto: document.querySelector('[data-micro-crypto]'),
    periodTabs: document.querySelector('[data-period-tabs]'),
    cryptoCta: document.querySelector('[data-cta-crypto]'),
    starsCta: document.querySelector('[data-cta-stars]'),
    footnote: document.querySelector('[data-footnote]'),
    headline: document.querySelector('[data-headline]'),
    subhead: document.querySelector('[data-subhead]'),
    eyebrow: document.querySelector('[data-eyebrow]'),
    freeTitle: document.querySelector('[data-free-title]'),
    freePrice: document.querySelector('[data-free-price]'),
    freeNote: document.querySelector('[data-free-note]'),
    freeFeatures: document.querySelectorAll('[data-free-feature]'),
    proTitle: document.querySelector('[data-pro-title]'),
  };

  const hasAllElements = Object.values(nodes).every((value) => value !== null && value !== undefined);
  return hasAllElements ? nodes : null;
};

const renderPeriodTabs = (language, container, currentPeriod) => {
  container.innerHTML = '';
  BILLING_PERIODS.forEach(({ key, label }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.period = key;
    button.className = 'period-tab';
    button.textContent = label[language];
    if (key === currentPeriod) {
      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');
    }
    container.appendChild(button);
  });
};

const applyLanguageCopy = (language, elements, periodKey) => {
  const copy = translations[language];
  elements.eyebrow.textContent = copy.eyebrow;
  elements.headline.textContent = copy.headline;
  elements.subhead.textContent = copy.subhead;
  elements.freeTitle.textContent = copy.free.title;
  elements.freePrice.textContent = copy.free.price;
  elements.freeNote.textContent = copy.free.note;
  elements.proTitle.textContent = copy.proTitle;

  elements.freeFeatures.forEach((item, index) => {
    item.textContent = copy.free.features[index] ?? '';
    item.toggleAttribute('hidden', index >= copy.free.features.length);
  });

  renderPeriodTabs(language, elements.periodTabs, periodKey);
  elements.cryptoCta.textContent = copy.ctaCrypto;
  elements.starsCta.textContent = copy.ctaStars;
  elements.footnote.innerHTML = `${copy.footnote[0]}<br />${copy.footnote[1]}`;
};

const updatePrices = (language, periodKey, elements) => {
  const period = BILLING_PERIODS.find((item) => item.key === periodKey) ?? BILLING_PERIODS[1];
  const priceUsd = period.priceUsd;
  const priceRub = Math.round(priceUsd * PAYMENT_RULES.usdToRubRate);
  const stars = Math.round(priceUsd * PAYMENT_RULES.starsPerUsd);
  const cryptoUsd = roundTo(priceUsd * (1 - PAYMENT_RULES.cryptoDiscount), 2);
  const ton = roundTo(cryptoUsd / PAYMENT_RULES.tonUsdRate, 2);
  const cryptoUsdFormatted = formatNumber(cryptoUsd, language, 2);
  const tonFormatted = formatNumber(ton, language, 2);

  const copy = translations[language];
  const periodLabel = period.label[language];

  if (language === 'ru') {
    elements.priceMain.textContent = copy.mainPrice(formatNumber(priceRub, language), periodLabel);
    elements.starsLine.textContent = copy.starsLine(stars);
    elements.cryptoLine.textContent = copy.cryptoLine(cryptoUsdFormatted);
    elements.cryptoBreakdown.textContent = copy.cryptoBreakdown(tonFormatted, cryptoUsdFormatted);
  } else {
    elements.priceMain.textContent = copy.mainPrice(formatNumber(priceUsd, language), periodLabel);
    elements.starsLine.textContent = copy.starsLine(stars);
    elements.cryptoLine.textContent = copy.cryptoLine(cryptoUsdFormatted);
    elements.cryptoBreakdown.textContent = copy.cryptoBreakdown(tonFormatted, cryptoUsdFormatted);
  }
};

const bindPeriodListeners = (container, onChange) => {
  container.addEventListener('click', (event) => {
    const target = event.target;
    if (!target.matches('[data-period]')) return;
    const period = target.dataset.period;
    if (!period) return;

    container.querySelectorAll('[data-period]').forEach((btn) => btn.classList.remove('is-active'));
    target.classList.add('is-active');
    target.setAttribute('aria-pressed', 'true');
    onChange(period);
  });
};

const bindLanguageSwitcher = (currentLanguage, apply) => {
  const buttons = document.querySelectorAll('[data-lang-switch]');
  let activeLanguage = currentLanguage;

  buttons.forEach((btn) => {
    const lang = btn.dataset.langSwitch;
    if (!lang) return;
    if (lang === activeLanguage) {
      btn.classList.add('is-active');
    }

    btn.addEventListener('click', () => {
      if (activeLanguage === lang) return;
      activeLanguage = lang;
      document.documentElement.lang = lang;
      buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.langSwitch === lang));
      apply(lang);
    });
  });

  return activeLanguage;
};

const initPaywall = () => {
  const elements = getElements();
  if (!elements) return;

  const initialLang = document.documentElement.lang || 'en';
  let currentLanguage = initialLang === 'ru' ? 'ru' : 'en';
  let currentPeriod = 'monthly';

  const refresh = () => {
    applyLanguageCopy(currentLanguage, elements, currentPeriod);
    updatePrices(currentLanguage, currentPeriod, elements);
  };

  currentLanguage = bindLanguageSwitcher(currentLanguage, (lang) => {
    currentLanguage = lang;
    refresh();
  });

  bindPeriodListeners(elements.periodTabs, (period) => {
    currentPeriod = period;
    refresh();
  });

  elements.cryptoCta.addEventListener('click', () => {
    elements.cryptoCta.blur();
  });

  elements.starsCta.addEventListener('click', () => {
    elements.starsCta.blur();
  });

  renderPeriodTabs(currentLanguage, elements.periodTabs, currentPeriod);
  refresh();
};

if (document.readyState !== 'loading') {
  initPaywall();
} else {
  document.addEventListener('DOMContentLoaded', initPaywall);
}
