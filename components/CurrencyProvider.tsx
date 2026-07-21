"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { CURRENCY_FOR_LOCALE, type CurrencyRates } from "@/lib/currency";

interface CurrencyContextValue {
  currency: string;
  setCurrency: (code: string) => void;
  rates: CurrencyRates;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function storageKeyFor(locale: string) {
  return `tbs_currency_${locale}`;
}

export function CurrencyProvider({ rates, children }: { rates: CurrencyRates; children: React.ReactNode }) {
  const locale = useLocale();
  const [currency, setCurrencyState] = useState(() => CURRENCY_FOR_LOCALE[locale] || "THB");

  // Whenever the site language changes, default the currency to match that
  // language's usual currency (e.g. French → EUR, Japanese → JPY) — unless
  // the visitor already picked a specific currency for that language before,
  // in which case we remember their choice per-language.
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(storageKeyFor(locale)) : null;
    setCurrencyState(saved || CURRENCY_FOR_LOCALE[locale] || "THB");
  }, [locale]);

  function setCurrency(code: string) {
    setCurrencyState(code);
    if (typeof window !== "undefined") window.localStorage.setItem(storageKeyFor(locale), code);
  }

  return <CurrencyContext.Provider value={{ currency, setCurrency, rates }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
