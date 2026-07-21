"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { refreshCurrencyRatesAction } from "@/lib/actions/currency";

export default function RefreshRatesButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await refreshCurrencyRatesAction();
            setMessage({ ok: result.ok, text: result.message || "" });
          });
        }}
        className="flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-jade)] transition hover:bg-[var(--color-jade)]/5 disabled:opacity-60"
      >
        <RefreshCw size={13} className={pending ? "animate-spin" : ""} />
        {pending ? "กำลังดึงข้อมูล..." : "ดึงอัตราแลกเปลี่ยนล่าสุด"}
      </button>
      {message && (
        <p className={`text-xs ${message.ok ? "text-[var(--color-jade)]" : "text-[var(--color-clay)]"}`}>{message.text}</p>
      )}
      {message?.ok && <p className="text-xs text-[var(--color-muted)]">รีเฟรชหน้านี้เพื่อดูค่าที่อัปเดตในช่องด้านล่าง</p>}
    </div>
  );
}
