"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import TourCard from "@/components/TourCard";
import Reveal from "@/components/motion/Reveal";
import type { Tour } from "@/lib/types";

export default function ToursGrid({ tours, pageSize = 6 }: { tours: Tour[]; pageSize?: number }) {
  const t = useTranslations("tours");
  const [visible, setVisible] = useState(pageSize);

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-3">
        {tours.slice(0, visible).map((tour, i) => (
          <Reveal key={tour.id} delay={(i % pageSize) * 0.08}>
            <TourCard tour={tour} />
          </Reveal>
        ))}
      </div>
      {visible < tours.length && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setVisible((v) => v + pageSize)}
            className="rounded-full border border-[var(--color-jade)] px-6 py-2.5 text-sm font-semibold text-[var(--color-jade)] transition hover:scale-105 hover:bg-[var(--color-jade)] hover:text-white"
          >
            {t("loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
