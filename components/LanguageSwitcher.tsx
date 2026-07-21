"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/routing";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className={`flex items-center gap-1.5 ${className}`}>
      <Globe size={14} className="opacity-70" />
      <span className="sr-only">{t("label")}</span>
      <select
        value={locale}
        onChange={(e) => {
          const nextLocale = e.target.value as Locale;
          router.replace(pathname, { locale: nextLocale });
        }}
        className="bg-transparent text-xs font-medium focus:outline-none"
      >
        {locales.map((l) => (
          <option key={l} value={l} className="text-[var(--color-ink)]">
            {localeLabels[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
