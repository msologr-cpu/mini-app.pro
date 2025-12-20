import { BILLING_PERIODS, PAYMENT_RULES, BillingPeriod } from './config/billingPeriods';

type Language = 'ru' | 'en';

type PaywallElements = {
  priceMain: HTMLElement;
  starsLine: HTMLElement;
  cryptoLine: HTMLElement;
  cryptoBreakdown: HTMLElement;
  microStars: HTMLElement;
  microCrypto: HTMLElement;
  periodTabs: HTMLElement;
  cryptoCta: HTMLButtonElement;
  starsCta: HTMLButtonElement;
  footnote: HTMLElement;
  headline: HTMLElement;
  subhead: HTMLElement;
  eyebrow: HTMLElement;
  freeTitle: HTMLElement;
  freePrice: HTMLElement;
  freeNote: HTMLElement;
  freeFeatures: NodeListOf<HTMLElement>;
  proTitle: HTMLElement;
};

const translations: Record<Language, {
  eyebrow: string;
  headline: string;
  subhead: string;
  free: { title: string; price: string; note: string; features: string[] };
  proTitle: string;
  mainPrice: (price: number, period: string) => string;
  starsLine: (stars: number) => string;
  cryptoLine: (cryptoUsd: number) => string;
  cryptoBreakdown: (ton: number, usdt: number) => string;
  microStars: string;
  microCrypto: string;
  ctaCrypto: string;
  ctaStars: string;
  footnote: [string, string];
}> = {
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

const formatNumber = (value: number, language: Language, maximumFractionDigits = 0): string =>
  value.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US', {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits > 0 ? 2 : 0,
  });

const roundTo = (value: number, digits = 0): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const getElements = (): PaywallElements | null => {
  const nodes = {
    priceMain: document.querySelector<HTMLElement>('[data-main-price]'),
    starsLine: document.querySelector<HTMLElement>('[data-stars-line]'),
    cryptoLine: document.querySelector<HTMLElement>('[data-crypto-line]'),
    cryptoBreakdown: document.querySelector<HTMLElement>('[data-crypto-breakdown]'),
    microStars: document.querySelector<HTMLElement>('[data-micro-stars]'),
    microCrypto: document.querySelector<HTMLElement>('[data-micro-crypto]'),
    periodTabs: document.querySelector<HTMLElement>('[data-period-tabs]'),
    cryptoCta: document.querySelector<HTMLButtonElement>('[data-cta-crypto]'),
    starsCta: document.querySelector<HTMLButtonElement>('[data-cta-stars]'),
    footnote: document.querySelector<HTMLElement>('[data-footnote]'),
    headline: document.querySelector<HTMLElement>('[data-headline]'),
    subhead: document.querySelector<HTMLElement>('[data-subhead]'),
    eyebrow: document.querySelector<HTMLElement>('[data-eyebrow]'),
    freeTitle: document.querySelector<HTMLElement>('[data-free-title]'),
    freePrice: document.querySelector<HTMLElement>('[data-free-price]'),
    freeNote: document.querySelector<HTMLElement>('[data-free-note]'),
    freeFeatures: document.querySelectorAll<HTMLElement>('[data-free-feature]'),
    proTitle: document.querySelector<HTMLElement>('[data-pro-title]'),
  };

  const hasAllElements = Object.values(nodes).every((value) => value !== null && value !== undefined);
  return hasAllElements ? (nodes as PaywallElements) : null;
};

const renderPeriodTabs = (language: Language, container: HTMLElement, currentPeriod: BillingPeriod): void => {
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

const applyLanguageCopy = (
  language: Language,
  elements: PaywallElements,
  periodKey: BillingPeriod,
): void => {
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

const updatePrices = (
  language: Language,
  periodKey: BillingPeriod,
  elements: PaywallElements,
): void => {
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

const bindPeriodListeners = (
  container: HTMLElement,
  onChange: (period: BillingPeriod) => void,
): void => {
  container.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.matches('[data-period]')) return;
    const period = target.dataset.period as BillingPeriod;
    if (!period) return;

    container.querySelectorAll('[data-period]').forEach((btn) => btn.classList.remove('is-active'));
    target.classList.add('is-active');
    target.setAttribute('aria-pressed', 'true');
    onChange(period);
  });
};

const bindLanguageSwitcher = (
  currentLanguage: Language,
  apply: (lang: Language) => void,
): Language => {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-lang-switch]');
  let activeLanguage = currentLanguage;

  buttons.forEach((btn) => {
    const lang = btn.dataset.langSwitch as Language | undefined;
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

const initPaywall = (): void => {
  const elements = getElements();
  if (!elements) return;

  const initialLang = (document.documentElement.lang as Language) || 'en';
  let currentLanguage: Language = initialLang === 'ru' ? 'ru' : 'en';
  let currentPeriod: BillingPeriod = 'monthly';

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
