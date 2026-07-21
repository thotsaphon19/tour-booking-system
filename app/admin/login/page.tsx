"use client";

import { useActionState, useState } from "react";
import { Loader2, LockKeyhole, Mail, Key, Eye, EyeOff } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = { ok: true };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[var(--color-sand)] px-5">
      <form action={formAction} className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-jade)]/10 text-[var(--color-jade)]">
          <LockKeyhole size={22} />
        </div>
        <h1 className="mt-4 text-center font-display text-2xl font-semibold text-[var(--color-jade-dark)]">
          เข้าสู่ระบบหลังบ้าน
        </h1>
        <p className="mt-1 text-center text-sm text-[var(--color-muted)]">สำหรับผู้ดูแลระบบเท่านั้น</p>

        {!state.ok && state.message && (
          <p className="mt-4 rounded-lg bg-[var(--color-clay)]/10 px-3 py-2 text-center text-sm text-[var(--color-clay)]">
            {state.message}
          </p>
        )}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
              <Mail size={13} /> อีเมล
            </span>
            <input name="email" type="email" required autoComplete="email" className="input" placeholder="admin@example.com" />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]">
              <Key size={13} /> รหัสผ่าน
            </span>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="input pr-10"
                placeholder="••••••••"
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
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-jade)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)] disabled:opacity-60"
        >
          {pending && <Loader2 size={16} className="animate-spin" />}
          {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid var(--color-border);
            border-radius: 0.75rem;
            padding: 0.65rem 0.9rem;
            font-size: 0.9rem;
          }
          .input:focus {
            outline: 2px solid var(--color-jade);
            outline-offset: 1px;
          }
        `}</style>
      </form>
    </div>
  );
}
