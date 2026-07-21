"use client";

import { useActionState } from "react";
import { Loader2, UserRound, Mail, Phone } from "lucide-react";
import type { Customer } from "@/lib/types";
import type { CustomerFormState } from "@/lib/actions/customers";
import { AdminSection, AdminField } from "@/components/admin/AdminFormKit";

const initialState: CustomerFormState = { ok: false };

export default function CustomerForm({
  action,
  customer,
  submitLabel = "บันทึก",
  readOnly = false,
}: {
  action: (prev: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;
  customer?: Customer;
  submitLabel?: string;
  readOnly?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-6">
      <fieldset disabled={readOnly} className="contents">
      {state.message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            state.ok ? "bg-[var(--color-jade)]/10 text-[var(--color-jade)]" : "bg-[var(--color-clay)]/10 text-[var(--color-clay)]"
          }`}
        >
          {state.message}
        </p>
      )}

      <AdminSection title="ข้อมูลลูกค้า" icon={UserRound}>
      <div className="space-y-3">
      <AdminField label="ชื่อ-นามสกุล" icon={UserRound} error={state.fieldErrors?.name}>
        <input name="name" defaultValue={customer?.name} required className="input" />
      </AdminField>
      <AdminField label="อีเมล" icon={Mail} error={state.fieldErrors?.email}>
        <input name="email" type="email" defaultValue={customer?.email} required className="input" />
      </AdminField>
      <AdminField label="เบอร์โทรศัพท์" icon={Phone}>
        <input name="phone" defaultValue={customer?.phone || ""} className="input" />
      </AdminField>
      </div>
      </AdminSection>
      </fieldset>

      {!readOnly && (
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)] disabled:opacity-60"
        >
          {pending && <Loader2 size={16} className="animate-spin" />}
          {pending ? "กำลังบันทึก..." : submitLabel}
        </button>
      )}

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
  );
}
