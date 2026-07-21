"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, Star, PenLine, X } from "lucide-react";
import { submitPublicReviewAction, type PublicReviewFormState } from "@/lib/actions/reviews";

const initialState: PublicReviewFormState = { ok: false };

export default function WriteReviewForm({ tours }: { tours: { id: number; title: string }[] }) {
  const t = useTranslations("reviews");
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitPublicReviewAction, initialState);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)]"
      >
        <PenLine size={16} /> {t("writeReview")}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      {state.ok ? (
        <div className="py-4 text-center">
          <CheckCircle2 className="mx-auto text-[var(--color-jade)]" size={40} />
          <h3 className="mt-3 font-display text-xl font-semibold text-[var(--color-jade-dark)]">{t("submitSuccessTitle")}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">{t("submitSuccessDesc")}</p>
          <button onClick={() => setOpen(false)} className="mt-4 text-sm font-medium text-[var(--color-jade)] underline">
            {t("close")}
          </button>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-[var(--color-jade-dark)]">{t("writeReview")}</h3>
            <button type="button" onClick={() => setOpen(false)} aria-label="close" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
              <X size={18} />
            </button>
          </div>

          {state.message && !state.ok && (
            <p className="rounded-lg bg-[var(--color-clay)]/10 px-3 py-2 text-sm text-[var(--color-clay)]">{state.message}</p>
          )}

          {/* Honeypot — hidden from real visitors via CSS, not `hidden`/`display:none`
              (which some bots skip filling), and never receives autofocus/tab order. */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-[var(--color-ink-soft)]">{t("ratingLabel")}</span>
            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  aria-label={`${n} ${t("ratingLabel")}`}
                  className="p-0.5"
                >
                  <Star
                    size={26}
                    className={(hoverRating || rating) >= n ? "fill-[var(--color-gold)] text-[var(--color-gold)]" : "text-[var(--color-border)]"}
                  />
                </button>
              ))}
            </div>
            <input type="hidden" name="rating" value={rating} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("formName")} error={state.fieldErrors?.customer_name}>
              <input name="customer_name" required className="input" />
            </Field>
            <Field label={t("formEmailOptional")} error={state.fieldErrors?.customer_email}>
              <input name="customer_email" type="email" className="input" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("formCountryOptional")}>
              <input name="customer_country" className="input" />
            </Field>
            <Field label={t("formTravelDatesOptional")}>
              <input name="travel_dates" className="input" placeholder={t("formTravelDatesPlaceholder")} />
            </Field>
          </div>

          {tours.length > 0 && (
            <Field label={t("formTourOptional")}>
              <select name="tour_id" className="input" defaultValue="">
                <option value="">—</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.title}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label={t("formReviewTitle")} error={state.fieldErrors?.title}>
            <input name="title" required className="input" />
          </Field>

          <Field label={t("formReviewQuote")} error={state.fieldErrors?.quote}>
            <textarea name="quote" rows={4} required className="input resize-none" />
          </Field>

          <p className="text-xs text-[var(--color-muted)]">{t("moderationNote")}</p>

          <button
            type="submit"
            disabled={pending}
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-jade)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)] disabled:opacity-60"
          >
            {pending && <Loader2 size={16} className="animate-spin" />}
            {pending ? t("sending") : t("submitReview")}
          </button>

          <style jsx>{`
            .input {
              width: 100%;
              border: 1px solid var(--color-border);
              border-radius: 0.75rem;
              padding: 0.6rem 0.85rem;
              font-size: 0.875rem;
              background: white;
            }
            .input:focus {
              outline: 2px solid var(--color-jade);
              outline-offset: 1px;
            }
          `}</style>
        </form>
      )}
    </div>
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
