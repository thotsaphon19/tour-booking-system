"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TourHeroGallery({
  images,
  alt,
  slideLabels,
}: {
  images: string[];
  alt: string;
  /** One label per image, e.g. ["Slide 1", "Slide 2", ...] — precomputed on
   *  the server since a translation function can't be passed as a prop to
   *  a Client Component (functions aren't serializable across that
   *  boundary; passing one directly crashes the page at render time). */
  slideLabels: string[];
}) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return null;
  const labelFor = (n: number) => slideLabels[n - 1] ?? `${n}`;

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[index]} alt={alt} className="h-full w-full object-cover opacity-80" />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={labelFor(index === 0 ? images.length : index)}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={labelFor(index + 2 > images.length ? 1 : index + 2)}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={labelFor(i + 1)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
