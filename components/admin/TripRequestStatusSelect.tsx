"use client";

import { useTransition } from "react";
import { Lock } from "lucide-react";
import { updateTripRequestStatusAction } from "@/lib/actions/tripRequests";

const options = [
  { value: "new", label: "ใหม่" },
  { value: "quoted", label: "ส่งใบเสนอราคาแล้ว" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "closed", label: "ปิดงาน" },
];

export default function TripRequestStatusSelect({ id, status, readOnly = false }: { id: number; status: string; readOnly?: boolean }) {
  const [pending, startTransition] = useTransition();

  if (readOnly) {
    return (
      <span
        title="ไม่มีสิทธิ์แก้ไข"
        className="flex w-fit items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-border)]/30 px-2 py-1.5 text-xs text-[var(--color-muted)]"
      >
        <Lock size={11} /> {options.find((o) => o.value === status)?.label}
      </span>
    );
  }

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateTripRequestStatusAction(id, e.target.value))}
      className="rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
