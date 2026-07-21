import { Star, Ticket, Compass, ThumbsUp, Camera, ExternalLink } from "lucide-react";
import type { SiteSettings } from "@/lib/queries/settings";

interface Badge {
  key: string;
  label: string;
  url: string;
  icon: React.ReactNode;
  accent: string;
  /** Optional uploaded logo image — when set, this renders instead of the
   *  icon + brand-color circle so the admin can use the platform's real
   *  logo (e.g. Facebook, TikTok). */
  logoUrl?: string;
}

function buildBadges(settings: SiteSettings): Badge[] {
  const badges: Badge[] = [];

  if (settings.tripadvisor_url) {
    badges.push({ key: "tripadvisor", label: "TripAdvisor", url: settings.tripadvisor_url, icon: <Star size={15} />, accent: "#34E0A1", logoUrl: settings.tripadvisor_logo_url });
  }
  if (settings.google_reviews_url) {
    badges.push({ key: "google", label: "Google Reviews", url: settings.google_reviews_url, icon: <Star size={15} />, accent: "#4285F4", logoUrl: settings.google_reviews_logo_url });
  }
  if (settings.getyourguide_url) {
    badges.push({ key: "gyg", label: "GetYourGuide", url: settings.getyourguide_url, icon: <Ticket size={15} />, accent: "#FF5533", logoUrl: settings.getyourguide_logo_url });
  }
  if (settings.kkday_url) {
    badges.push({ key: "kkday", label: "KKday", url: settings.kkday_url, icon: <Ticket size={15} />, accent: "#00C7B1", logoUrl: settings.kkday_logo_url });
  }
  if (settings.viator_url) {
    badges.push({ key: "viator", label: "Viator", url: settings.viator_url, icon: <Compass size={15} />, accent: "#3A7DC9", logoUrl: settings.viator_logo_url });
  }
  if (settings.facebook_url) {
    badges.push({ key: "facebook", label: "Facebook", url: settings.facebook_url, icon: <ThumbsUp size={15} />, accent: "#1877F2", logoUrl: settings.facebook_logo_url });
  }
  if (settings.instagram_url) {
    badges.push({ key: "instagram", label: "Instagram", url: settings.instagram_url, icon: <Camera size={15} />, accent: "#E1306C", logoUrl: settings.instagram_logo_url });
  }
  for (const n of [1, 2, 3] as const) {
    const label = settings[`custom_review_${n}_label`];
    const url = settings[`custom_review_${n}_url`];
    if (label && url) {
      badges.push({ key: `custom-${n}`, label, url, icon: <ExternalLink size={15} />, accent: "var(--color-gold)", logoUrl: settings[`custom_review_${n}_logo_url`] });
    }
  }

  return badges;
}

export default function TrustBadges({
  settings,
  label,
  variant = "light",
}: {
  settings: SiteSettings;
  label?: string;
  variant?: "light" | "dark";
}) {
  const badges = buildBadges(settings);
  if (badges.length === 0) return null;

  const isDark = variant === "dark";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {label && (
        <span className={`text-xs font-medium ${isDark ? "text-[var(--color-sand)]/60" : "text-[var(--color-muted)]"}`}>{label}</span>
      )}
      {badges.map((b) => (
        <a
          key={b.key}
          href={b.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition hover:-translate-y-0.5 hover:shadow-md ${
            isDark
              ? "border-white/15 bg-white/5 text-[var(--color-sand)]/80 hover:border-white/30"
              : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:border-[var(--color-jade)]/40"
          }`}
        >
          {b.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.logoUrl} alt="" className="h-5 w-5 rounded-full object-contain" />
          ) : (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: b.accent }}
            >
              {b.icon}
            </span>
          )}
          {b.label}
        </a>
      ))}
    </div>
  );
}
