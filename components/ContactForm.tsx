"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitContact, type ContactFormState } from "@/lib/actions/contact";

const initialState: ContactFormState = { ok: false };

export default function ContactForm() {
  const t = useTranslations("contact");
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-[var(--color-jade)]/30 bg-[var(--color-jade)]/5 p-8 text-center">
        <CheckCircle2 className="mx-auto text-[var(--color-jade)]" size={40} />
        <h3 className="mt-3 font-display text-xl font-semibold text-[var(--color-jade-dark)]">{t("successTitle")}</h3>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.message && !state.ok && (
        <p className="rounded-lg bg-[var(--color-clay)]/10 px-3 py-2 text-sm text-[var(--color-clay)]">{state.message}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("formName")} error={state.fieldErrors?.name}>
          <input name="name" required className="input" />
        </Field>
        <Field label={t("formEmail")} error={state.fieldErrors?.email}>
          <input name="email" type="email" required className="input" />
        </Field>
      </div>
      <Field label={t("formSubject")}>
        <input name="subject" className="input" placeholder={t("formSubjectPlaceholder")} />
      </Field>
      <Field label={t("formMessage")} error={state.fieldErrors?.message}>
        <textarea name="message" rows={5} required className="input resize-none" />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-jade)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)] disabled:opacity-60"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? t("formSending") : t("formSubmit")}
      </button>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.65rem 0.9rem;
          font-size: 0.9rem;
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
