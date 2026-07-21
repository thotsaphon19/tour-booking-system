import type { SiteSettings } from "@/lib/queries/settings";
import { parseHeroImages } from "@/lib/queries/settings";

/** Renders the row of payment-method logo images (PayPal, Wise, credit
 *  cards, Amazing Thailand, etc.) that the admin uploads under
 *  Settings → Payment methods. Renders nothing if none are configured. */
export default function PaymentBadges({
  settings,
  label,
  variant = "light",
}: {
  settings: SiteSettings;
  label?: string;
  variant?: "light" | "dark";
}) {
  const logos = parseHeroImages(settings.payment_logos);
  if (logos.length === 0) return null;

  const isDark = variant === "dark";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {label && (
        <span className={`text-xs font-medium ${isDark ? "text-[var(--color-sand)]/60" : "text-[var(--color-muted)]"}`}>{label}</span>
      )}
      {logos.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`${src}-${i}`} src={src} alt="" className="h-7 w-auto object-contain" />
      ))}
    </div>
  );
}
