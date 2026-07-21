"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { formatFromTHB } from "@/lib/currency";

/** Renders a price stored in THB, converted and formatted in the currently selected currency. */
export default function Price({ amountTHB, className }: { amountTHB: number; className?: string }) {
  const { currency, rates } = useCurrency();
  return <span className={className}>{formatFromTHB(amountTHB, currency, rates)}</span>;
}
