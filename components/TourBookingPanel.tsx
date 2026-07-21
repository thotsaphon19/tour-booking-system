"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, CalendarCheck, MessageSquareText } from "lucide-react";
import { submitBooking, type BookingFormState } from "@/lib/actions/booking";
import Price from "@/components/Price";
import type { PriceTier } from "@/lib/types";

const initialState: BookingFormState = { ok: false };

function pricePerPersonFor(tiers: PriceTier[], basePrice: number, travelers: number) {
  if (tiers.length === 0) return basePrice;
  const sorted = [...tiers].sort((a, b) => a.groupSize - b.groupSize);
  let match = sorted[0];
  for (const tier of sorted) {
    if (travelers >= tier.groupSize) match = tier;
  }
  return match.pricePerPerson;
}

export default function TourBookingPanel({
  tourId,
  price,
  currency,
  priceTiers = [],
  agentName,
  agentRole,
  agentPhotoUrl,
  departureDates = [],
}: {
  tourId: number;
  price: number;
  currency: string;
  priceTiers?: PriceTier[];
  agentName?: string | null;
  agentRole?: string | null;
  agentPhotoUrl?: string | null;
  departureDates?: string[];
}) {
  const t = useTranslations("booking");
  const tDetail = useTranslations("tourDetail");
  const [state, formAction, pending] = useActionState(submitBooking, initialState);
  const [travelers, setTravelers] = useState(2);
  const [mode, setMode] = useState<"booking" | "quote">("booking");
  const formRef = useRef<HTMLDivElement>(null);

  const pricePerPerson = useMemo(() => pricePerPersonFor(priceTiers, price, travelers), [priceTiers, price, travelers]);
  const today = new Date().toISOString().slice(0, 10);
  const upcomingDepartures = departureDates.filter((d) => d >= today).sort();

  function askForQuote() {
    setMode("quote");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-xs text-[var(--color-muted)]">{tDetail("startingFrom")}</p>
        <p className="font-mono-data text-2xl font-semibold text-[var(--color-jade)]">
          <Price amountTHB={pricePerPerson} />
          <span className="text-sm font-normal text-[var(--color-muted)]"> {tDetail("perPerson")}</span>
        </p>
      </div>

      {(agentName || agentPhotoUrl) && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center">
          {agentPhotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agentPhotoUrl} alt={agentName || "agent"} className="mx-auto h-16 w-16 rounded-full object-cover" />
          )}
          {agentName && <p className="mt-3 font-display font-semibold text-[var(--color-jade-dark)]">{agentName}</p>}
          {agentRole && <p className="text-xs text-[var(--color-muted)]">{agentRole}</p>}
          <button
            onClick={askForQuote}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-clay)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <MessageSquareText size={15} /> {t("askQuoteButton")}
          </button>
          <p className="mt-2 text-xs text-[var(--color-muted)]">{t("askQuoteNote")}</p>
        </div>
      )}

      <div ref={formRef}>
        {state.ok ? (
          <div className="rounded-2xl border border-[var(--color-jade)]/30 bg-[var(--color-jade)]/5 p-6 text-center">
            <CheckCircle2 className="mx-auto text-[var(--color-jade)]" size={40} />
            <h3 className="mt-3 font-display text-xl font-semibold text-[var(--color-jade-dark)]">
              {state.requestType === "quote" ? t("successQuote") : t("successBooking")}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">#{state.bookingId}</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <input type="hidden" name="tour_id" value={tourId} />
            <input type="hidden" name="request_type" value={mode} />

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--color-sand)] p-1">
              <button
                type="button"
                onClick={() => setMode("booking")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                  mode === "booking" ? "bg-[var(--color-jade)] text-white shadow-sm" : "text-[var(--color-ink-soft)]"
                }`}
              >
                <CalendarCheck size={14} /> {t("instant")}
              </button>
              <button
                type="button"
                onClick={() => setMode("quote")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                  mode === "quote" ? "bg-[var(--color-gold)] text-[var(--color-jade-dark)] shadow-sm" : "text-[var(--color-ink-soft)]"
                }`}
              >
                <MessageSquareText size={14} /> {t("quote")}
              </button>
            </div>

            <h3 className="font-display text-lg font-semibold text-[var(--color-jade-dark)]">
              {mode === "quote" ? t("quoteTitle") : t("bookTitle")}
            </h3>
            {mode === "quote" && <p className="-mt-2 text-xs text-[var(--color-muted)]">{t("quoteNote")}</p>}

            {state.message && (
              <p className="rounded-lg bg-[var(--color-clay)]/10 px-3 py-2 text-sm text-[var(--color-clay)]">{state.message}</p>
            )}

            <Field label={t("name")} error={state.fieldErrors?.name}>
              <input name="name" required className="input" placeholder={t("namePlaceholder")} />
            </Field>
            <Field label={t("email")} error={state.fieldErrors?.email}>
              <input name="email" type="email" required className="input" placeholder="you@example.com" />
            </Field>
            <Field label={t("phone")} error={state.fieldErrors?.phone}>
              <input name="phone" required className="input" placeholder="08x-xxx-xxxx" />
            </Field>
            <Field label={mode === "quote" ? t("travelDateApprox") : t("travelDate")} error={state.fieldErrors?.travel_date}>
              {mode === "booking" && upcomingDepartures.length > 0 ? (
                <select name="travel_date" required defaultValue="" className="input">
                  <option value="" disabled>
                    {t("selectDeparture")}
                  </option>
                  {upcomingDepartures.map((d) => (
                    <option key={d} value={d}>
                      {new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    </option>
                  ))}
                </select>
              ) : (
                <input name="travel_date" type="date" required className="input" min={mode === "booking" ? today : undefined} />
              )}
            </Field>
            {mode === "booking" && upcomingDepartures.length > 0 && (
              <p className="-mt-2 text-xs text-[var(--color-muted)]">{t("fixedDeparturesNote")}</p>
            )}
            <Field label={t("travelers")} error={state.fieldErrors?.num_travelers}>
              <input
                name="num_travelers"
                type="number"
                min={1}
                max={50}
                required
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value) || 1)}
                className="input"
              />
            </Field>
            <Field label={t("notes")}>
              <textarea
                name="notes"
                rows={3}
                className="input resize-none"
                placeholder={mode === "quote" ? t("notesPlaceholderQuote") : t("notesPlaceholderBooking")}
              />
            </Field>

            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
              <span className="text-sm text-[var(--color-muted)]">{mode === "quote" ? t("estimatedPrice") : t("estimatedTotal")}</span>
              <span className="font-mono-data text-lg font-semibold text-[var(--color-jade)]">
                <Price amountTHB={pricePerPerson * travelers} />
              </span>
            </div>

            <button
              type="submit"
              disabled={pending}
              className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                mode === "quote"
                  ? "bg-[var(--color-gold)] text-[var(--color-jade-dark)] hover:bg-[var(--color-gold-light)]"
                  : "bg-[var(--color-jade)] text-white hover:bg-[var(--color-jade-light)]"
              }`}
            >
              {pending && <Loader2 size={16} className="animate-spin" />}
              {pending ? t("sending") : mode === "quote" ? t("submitQuote") : t("submitBooking")}
            </button>
            <p className="text-center text-xs text-[var(--color-muted)]">
              {mode === "quote" ? t("disclaimerQuote") : t("disclaimerBooking")}
            </p>
          </form>
        )}
      </div>

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
