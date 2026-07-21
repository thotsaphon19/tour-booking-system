import { useTranslations } from "next-intl";

export default function RouteMap({ embedUrl, title }: { embedUrl: string; title: string }) {
  const t = useTranslations("tourDetail");
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
      <iframe
        src={embedUrl}
        title={t("routeMapTitle", { title })}
        className="h-56 w-full sm:h-64"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
