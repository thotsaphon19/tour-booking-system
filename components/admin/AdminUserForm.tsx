"use client";

import { useActionState, useState } from "react";
import { Loader2, UserRound, Mail, Key, ShieldCheck, ListChecks, Eye, EyeOff } from "lucide-react";
import type { AdminUser } from "@/lib/types";
import type { AdminUserFormState } from "@/lib/actions/admins";
import { PERMISSION_SECTIONS } from "@/lib/permissions";
import { AdminSection } from "@/components/admin/AdminFormKit";

const initialState: AdminUserFormState = { ok: false };

export default function AdminUserForm({
  action,
  admin,
  submitLabel = "บันทึก",
  isEditingSelf = false,
}: {
  action: (prev: AdminUserFormState, formData: FormData) => Promise<AdminUserFormState>;
  admin?: AdminUser;
  submitLabel?: string;
  isEditingSelf?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [role, setRole] = useState<"admin" | "super_admin">(admin?.role || "admin");
  const [permissions, setPermissions] = useState<string[]>(admin?.permissions || []);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordsMatch = password === confirmPassword;

  function togglePermission(key: string) {
    setPermissions((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  }

  return (
    <form
      action={formAction}
      className="max-w-xl space-y-6"
      onSubmit={(e) => {
        // Confirm-password is a client-side-only safety net (not sent to
        // the server) so a typo can't silently lock the admin out — this is
        // the most common real cause of "I changed my password but the new
        // one doesn't work": what got typed and what got submitted weren't
        // actually the same string, often because of a browser/password
        // manager autofill substitution the person didn't notice.
        if (password && !passwordsMatch) e.preventDefault();
      }}
    >
      {state.message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            state.ok ? "bg-[var(--color-jade)]/10 text-[var(--color-jade)]" : "bg-[var(--color-clay)]/10 text-[var(--color-clay)]"
          }`}
        >
          {state.message}
        </p>
      )}

      <AdminSection title="ข้อมูลบัญชี" icon={UserRound}>
      <div className="space-y-3">
      <Field label="ชื่อ" icon={UserRound} error={state.fieldErrors?.name}>
        <input name="name" defaultValue={admin?.name} required autoComplete="name" className="input" />
      </Field>
      <Field label="อีเมล" icon={Mail} error={state.fieldErrors?.email}>
        <input
          name="email"
          type="email"
          defaultValue={admin?.email}
          required
          disabled={!!admin}
          autoComplete="email"
          className="input disabled:opacity-60"
        />
      </Field>
      {admin && <input type="hidden" name="email" value={admin.email} />}
      <Field label={admin ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)" : "รหัสผ่าน"} icon={Key} error={state.fieldErrors?.password}>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required={!admin}
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // "new-password" (not "current-password") is the critical bit
            // here — without it, browsers/password managers can treat this
            // as a login field and silently substitute the admin's *old*
            // saved password instead of what was actually typed.
            autoComplete="new-password"
            className="input pr-10"
            placeholder="อย่างน้อย 8 ตัวอักษร"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink-soft)]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>
      {password && (
        <Field label="ยืนยันรหัสผ่านใหม่อีกครั้ง" icon={Key} error={!passwordsMatch ? "รหัสผ่านไม่ตรงกัน กรุณาพิมพ์ให้เหมือนกัน" : undefined}>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="input"
            placeholder="พิมพ์รหัสผ่านใหม่อีกครั้งให้ตรงกัน"
          />
        </Field>
      )}
      </div>
      </AdminSection>

      <AdminSection title="สิทธิ์การใช้งาน" icon={ShieldCheck}>
      <div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={() => setRole("admin")}
              disabled={isEditingSelf && admin?.role === "super_admin"}
            />
            Admin (กำหนดสิทธิ์รายหน้าได้)
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <input
              type="radio"
              name="role"
              value="super_admin"
              checked={role === "super_admin"}
              onChange={() => setRole("super_admin")}
              disabled={isEditingSelf}
            />
            Super Admin (ทำได้ทุกอย่าง)
          </label>
        </div>
        {isEditingSelf && <p className="mt-1 text-xs text-[var(--color-muted)]">ไม่สามารถเปลี่ยนสิทธิ์ของบัญชีตัวเองได้</p>}
      </div>

      {role === "admin" && (
        <div>
          <span className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
            <ListChecks size={13} /> หน้าที่มีสิทธิ์เพิ่ม/แก้ไข/ลบข้อมูลได้ (หน้าที่ไม่ติ๊กจะเข้าดูได้ แต่แก้ไขไม่ได้)
          </span>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--color-border)] p-3 sm:grid-cols-3">
            {PERMISSION_SECTIONS.map((s) => (
              <label key={s.key} className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
                <input
                  type="checkbox"
                  name="permissions"
                  value={s.key}
                  checked={permissions.includes(s.key)}
                  onChange={() => togglePermission(s.key)}
                  className="h-4 w-4 rounded"
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>
      )}
      </AdminSection>

      <button
        type="submit"
        disabled={pending || (!!password && !passwordsMatch)}
        className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)] disabled:opacity-60"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? "กำลังบันทึก..." : submitLabel}
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
  );
}

function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
        {Icon && <Icon size={13} className="flex-shrink-0" />} {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-[var(--color-clay)]">{error}</span>}
    </label>
  );
}
