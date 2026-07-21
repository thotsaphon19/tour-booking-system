export interface CurrencyInfo {
  code: string;
  label: string;
  symbol: string;
  locale: string; // Intl.NumberFormat locale to use for grouping/decimal style
}

// The order here is also the display order in the currency switcher.
export const CURRENCIES: CurrencyInfo[] = [
  { code: "THB", label: "บาทไทย (THB)", symbol: "฿", locale: "th-TH" },
  { code: "USD", label: "US Dollar (USD)", symbol: "$", locale: "en-US" },
  { code: "EUR", label: "Euro (EUR)", symbol: "€", locale: "de-DE" },
  { code: "GBP", label: "British Pound (GBP)", symbol: "£", locale: "en-GB" },
  { code: "JPY", label: "Japanese Yen (JPY)", symbol: "¥", locale: "ja-JP" },
  { code: "AUD", label: "Australian Dollar (AUD)", symbol: "A$", locale: "en-AU" },
  { code: "CAD", label: "Canadian Dollar (CAD)", symbol: "C$", locale: "en-CA" },
];

// Default currency to switch to when a visitor picks a given site language.
// The visitor can still override this manually — see CurrencyProvider.
export const CURRENCY_FOR_LOCALE: Record<string, string> = {
  th: "THB",
  en: "USD",
  fr: "EUR",
  de: "EUR",
  ja: "JPY",
};

export type CurrencyRates = Record<string, number>;

export function ratesFromSettings(settings: {
  rate_usd: string;
  rate_eur: string;
  rate_gbp: string;
  rate_jpy: string;
  rate_aud: string;
  rate_cad: string;
}): CurrencyRates {
  return {
    THB: 1,
    USD: Number(settings.rate_usd) || 0.028,
    EUR: Number(settings.rate_eur) || 0.026,
    GBP: Number(settings.rate_gbp) || 0.022,
    JPY: Number(settings.rate_jpy) || 4.3,
    AUD: Number(settings.rate_aud) || 0.043,
    CAD: Number(settings.rate_cad) || 0.038,
  };
}

/** Converts an amount stored in THB into the target currency. */
export function convertFromTHB(amountTHB: number, currency: string, rates: CurrencyRates): number {
  const rate = rates[currency];
  if (!rate) return amountTHB;
  return amountTHB * rate;
}

export function formatCurrency(amount: number, currency: string): string {
  const info = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  return new Intl.NumberFormat(info.locale, {
    style: "currency",
    currency: info.code,
    maximumFractionDigits: info.code === "THB" || info.code === "JPY" ? 0 : 2,
  }).format(amount);
}

/** Convenience: convert a THB amount and format it in one go. */
export function formatFromTHB(amountTHB: number, currency: string, rates: CurrencyRates): string {
  return formatCurrency(convertFromTHB(amountTHB, currency, rates), currency);
}
