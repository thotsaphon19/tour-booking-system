"use client";

import { useState } from "react";

export default function TourTabs({
  tabs,
  action,
}: {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  action?: React.ReactNode;
}) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div>
      <div className="sticky top-[73px] z-30 -mx-5 flex items-center justify-between gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-sand)]/95 px-5 backdrop-blur sm:mx-0 sm:px-0">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                active === tab.id
                  ? "border-[var(--color-jade)] text-[var(--color-jade)]"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink-soft)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {action && <div className="hidden flex-shrink-0 sm:block">{action}</div>}
      </div>
      <div className="pt-8">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
