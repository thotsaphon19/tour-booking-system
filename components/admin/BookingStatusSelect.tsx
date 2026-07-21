"use client";

import { useTransition } from "react";
import { Lock } from "lucide-react";
import { updateBookingStatusAction } from "@/lib/actions/bookings";
import type { BookingStatus } from "@/lib/types";

const options: { value: BookingStatus; label: string }[] = [
  { value: "pending", label: "รอยืนยัน" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "cancelled", label: "ยกเลิก" },
];

export default function BookingStatusSelect({ id, status, readOnly = false }: { id: number; status: BookingStatus; readOnly?: boolean }) {
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
      onChange={(e) => {
        const value = e.target.value as BookingStatus;
        startTransition(() => {
          updateBookingStatusAction(id, value);
        });
      }}
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
