"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { CURRENCIES } from "@/lib/currency";
import { Coins } from "lucide-react";

export default function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <label className={`flex items-center gap-1.5 ${className}`}>
      <Coins size={14} className="opacity-70" />
      <span className="sr-only">Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-transparent text-xs font-medium focus:outline-none"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code} className="text-[var(--color-ink)]">
            {c.code}
          </option>
        ))}
      </select>
    </label>
  );
}
