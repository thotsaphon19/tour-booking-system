"use client";

import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { toggleTourStatusAction } from "@/lib/actions/tours";
import type { TourStatus } from "@/lib/types";

export default function TourStatusToggle({ id, status, readOnly = false }: { id: number; status: TourStatus; readOnly?: boolean }) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();

  if (readOnly) {
    return (
      <span
        title="ไม่มีสิทธิ์แก้ไข"
        className="flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-border)]/30 px-2.5 py-1 text-xs text-[var(--color-muted)]"
      >
        <Lock size={11} /> {current === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
      </span>
    );
  }

  const isActive = current === "active";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next: TourStatus = isActive ? "draft" : "active";
        setCurrent(next);
        startTransition(() => {
          toggleTourStatusAction(id, next);
        });
      }}
      title={isActive ? "กดเพื่อปิดทัวร์นี้ (ซ่อนจากหน้าเว็บ)" : "กดเพื่อเปิดทัวร์นี้ (แสดงบนหน้าเว็บ)"}
      className="flex items-center gap-2 disabled:opacity-50"
    >
      <span
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${isActive ? "bg-[var(--color-jade)]" : "bg-[var(--color-border)]"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            isActive ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className={`text-xs font-medium ${isActive ? "text-[var(--color-jade)]" : "text-[var(--color-muted)]"}`}>
        {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
      </span>
    </button>
  );
}
