"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";

export default function HeroCarousel({ images }: { images: string[] }) {
  const t = useTranslations("tourDetail");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.img
          key={images[active]}
          src={images[active]}
          alt=""
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.15 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.1, ease: "easeInOut" },
            scale: { duration: 5, ease: "linear" },
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={t("heroSlideLabel", { number: i + 1 })}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-[var(--color-gold)]" : "w-2 bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
