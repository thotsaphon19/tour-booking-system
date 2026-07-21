import { useTranslations } from "next-intl";
import type { PriceTier } from "@/lib/types";
import Price from "@/components/Price";

export default function PriceTierTable({
  tiers,
  currency,
  fallbackPrice,
  note,
}: {
  tiers: PriceTier[];
  currency: string;
  fallbackPrice: number;
  note?: string;
}) {
  const t = useTranslations("tourDetail");
  const rows = tiers.length > 0 ? [...tiers].sort((a, b) => a.groupSize - b.groupSize) : [{ groupSize: 1, pricePerPerson: fallbackPrice }];

  return (
    <div>
      <p className="text-sm text-[var(--color-muted)]">{note || t("priceNote")}</p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[var(--color-jade)]/5 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <th className="px-4 py-3">{t("groupSizeHeader")}</th>
              <th className="px-4 py-3">{t("pricePerPersonHeader")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tier) => (
              <tr key={tier.groupSize} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-medium text-[var(--color-ink-soft)]">
                  {tier.groupSize} {t("peopleUnit")}
                </td>
                <td className="px-4 py-3 font-mono-data font-semibold text-[var(--color-jade)]">
                  <Price amountTHB={tier.pricePerPerson} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
