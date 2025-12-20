export type BillingPeriod = 'weekly' | 'monthly' | '3m' | '6m' | 'yearly';

export const BILLING_PERIODS = [
  { key: 'weekly', label: { ru: 'Неделя', en: 'Weekly' }, priceUsd: 9 },
  { key: 'monthly', label: { ru: 'Месяц', en: 'Monthly' }, priceUsd: 19 },
  { key: '3m', label: { ru: '3 месяца', en: '3m' }, priceUsd: 49 },
  { key: '6m', label: { ru: '6 месяцев', en: '6m' }, priceUsd: 89 },
  { key: 'yearly', label: { ru: 'Год', en: 'Yearly' }, priceUsd: 189 },
] as const;

export const PAYMENT_RULES = {
  usdToRubRate: 95,
  starsPerUsd: 56,
  cryptoDiscount: 0.15,
  tonUsdRate: 5.0,
};
