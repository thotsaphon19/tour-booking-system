"use client";

import { useActionState, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, Loader2, Pencil } from "lucide-react";
import { submitPersonalizeRequest, type PersonalizeFormState } from "@/lib/actions/personalize";
import { CURRENCIES } from "@/lib/currency";

const initialState: PersonalizeFormState = { ok: false };

const guideLanguagesByLocale: Record<string, string[]> = {
  th: ["ไทย", "อังกฤษ", "ฝรั่งเศส", "เยอรมัน", "ญี่ปุ่น", "จีน", "อื่นๆ"],
  en: ["Thai", "English", "French", "German", "Japanese", "Chinese", "Other"],
  fr: ["Thaï", "Anglais", "Français", "Allemand", "Japonais", "Chinois", "Autre"],
  de: ["Thailändisch", "Englisch", "Französisch", "Deutsch", "Japanisch", "Chinesisch", "Andere"],
  ja: ["タイ語", "英語", "フランス語", "ドイツ語", "日本語", "中国語", "その他"],
};

export default function PersonalizeForm({ tourSlug }: { tourSlug?: string }) {
  const t = useTranslations("personalize");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(submitPersonalizeRequest, initialState);
  const [guidePreference, setGuidePreference] = useState("no_guide");

  const guideLanguages = guideLanguagesByLocale[locale] || guideLanguagesByLocale.en;

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-[var(--color-jade)]/30 bg-[var(--color-jade)]/5 p-8 text-center">
        <CheckCircle2 className="mx-auto text-[var(--color-jade)]" size={40} />
        <h3 className="mt-3 font-display text-xl font-semibold text-[var(--color-jade-dark)]">{t("successTitle")}</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{t("responseNote")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {tourSlug && <input type="hidden" name="tour_slug" value={tourSlug} />}
      <div className="flex items-center gap-2 text-[var(--color-jade)]">
        <Pencil size={18} />
        <h2 className="font-display text-xl font-semibold text-[var(--color-jade-dark)]">{t("title")}</h2>
      </div>
      <p className="text-sm text-[var(--color-muted)]">{t("desc")}</p>

      {state.message && !state.ok && (
        <p className="rounded-lg bg-[var(--color-clay)]/10 px-3 py-2 text-sm text-[var(--color-clay)]">{state.message}</p>
      )}

      <Field label={t("flightNoticeTitle")} error={state.fieldErrors?.flight_ack}>
        <div className="flex gap-5 pt-1 text-sm text-[var(--color-ink-soft)]">
          <label className="flex items-center gap-1.5">
            <input type="radio" name="flight_ack" value="ok" required defaultChecked /> {t("flightNoticeOk")}
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="flight_ack" value="no" /> {t("flightNoticeNo")}
          </label>
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("firstName")} error={state.fieldErrors?.first_name}>
          <input name="first_name" required className="input" />
        </Field>
        <Field label={t("lastName")} error={state.fieldErrors?.last_name}>
          <input name="last_name" required className="input" />
        </Field>
      </div>

      <Field label={t("email")} error={state.fieldErrors?.email}>
        <input name="email" type="email" required className="input" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("nationality")} error={state.fieldErrors?.nationality}>
          <input name="nationality" required className="input" placeholder={t("nationalityPlaceholder")} />
        </Field>
        <Field label={t("whatsapp")} error={state.fieldErrors?.whatsapp}>
          <input name="whatsapp" required className="input" placeholder={t("whatsappPlaceholder")} />
        </Field>
      </div>

      <Field label={t("tripLengthDays")} error={state.fieldErrors?.trip_length_days}>
        <input name="trip_length_days" type="number" min={1} required className="input" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("arrivalDate")} error={state.fieldErrors?.arrival_date}>
          <input name="arrival_date" type="date" required className="input" />
        </Field>
        <Field label={t("departureDate")} error={state.fieldErrors?.departure_date}>
          <input name="departure_date" type="date" required className="input" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("travelerCount")} error={state.fieldErrors?.traveler_count}>
          <input name="traveler_count" type="number" min={1} defaultValue={2} required className="input" />
        </Field>
        <Field label={t("travelerType")} error={state.fieldErrors?.traveler_type}>
          <select name="traveler_type" className="input" defaultValue="" required>
            <option value="" disabled>{t("travelerTypeSelect")}</option>
            <option value={t("travelerTypeSolo")}>{t("travelerTypeSolo")}</option>
            <option value={t("travelerTypeCouple")}>{t("travelerTypeCouple")}</option>
            <option value={t("travelerTypeFamily")}>{t("travelerTypeFamily")}</option>
            <option value={t("travelerTypeFamilyKids")}>{t("travelerTypeFamilyKids")}</option>
            <option value={t("travelerTypeFriends")}>{t("travelerTypeFriends")}</option>
            <option value={t("travelerTypeGroup")}>{t("travelerTypeGroup")}</option>
          </select>
        </Field>
      </div>

      <Field label={t("guidePreference")} error={state.fieldErrors?.guide_preference}>
        <div className="flex flex-col gap-1.5 pt-1 text-sm text-[var(--color-ink-soft)]">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="guide_preference"
              value="private_guide"
              checked={guidePreference === "private_guide"}
              onChange={() => setGuidePreference("private_guide")}
            />{" "}
            {t("guidePrivate")}
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="guide_preference"
              value="no_guide"
              checked={guidePreference === "no_guide"}
              onChange={() => setGuidePreference("no_guide")}
            />{" "}
            {t("guideNone")}
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="guide_preference"
              value="car_with_driver"
              checked={guidePreference === "car_with_driver"}
              onChange={() => setGuidePreference("car_with_driver")}
            />{" "}
            {t("guideCarOnly")}
          </label>
        </div>
      </Field>

      {guidePreference === "private_guide" && (
        <Field label={t("guideLanguage")}>
          <select name="guide_language" className="input" defaultValue="">
            <option value="" disabled>{t("guideLanguageSelect")}</option>
            {guideLanguages.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
      )}

      <Field label={t("hotelLevel")} error={state.fieldErrors?.hotel_level}>
        <div className="flex flex-col gap-1.5 pt-1 text-sm text-[var(--color-ink-soft)]">
          <label className="flex items-center gap-1.5">
            <input type="radio" name="hotel_level" value={t("hotel3Star")} required /> {t("hotel3Star")}
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="hotel_level" value={t("hotel4Star")} /> {t("hotel4Star")}
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="hotel_level" value={t("hotelHomestay")} /> {t("hotelHomestay")}
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="hotel_level" value={t("hotelAlreadyBooked")} /> {t("hotelAlreadyBooked")}
          </label>
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("currency")} error={state.fieldErrors?.currency}>
          <select name="currency" className="input" defaultValue="">
            <option value="" disabled>{t("currencySelect")}</option>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label={t("budgetPerPerson")} error={state.fieldErrors?.budget_per_person}>
          <input name="budget_per_person" type="number" min={0} required className="input" placeholder={t("budgetPerPersonPlaceholder")} />
        </Field>
      </div>

      <Field label={t("placesOfInterest")}>
        <textarea name="places_of_interest" rows={3} className="input resize-none" placeholder={t("placesOfInterestPlaceholder")} />
      </Field>

      <p className="text-xs text-[var(--color-muted)]">{t("requiredNote")}</p>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-clay)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? t("sending") : t("submit")}
      </button>
      <p className="text-center text-xs text-[var(--color-muted)]">{t("responseNote")}</p>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.65rem 0.9rem;
          font-size: 0.875rem;
          background: white;
        }
        .input:focus {
          outline: 2px solid var(--color-jade);
          outline-offset: 1px;
        }
      `}</style>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[var(--color-ink-soft)]">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-[var(--color-clay)]">{error}</span>}
    </label>
  );
}
