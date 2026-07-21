"use client";

import { useSyncExternalStore } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Plane, ArrowRight, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/routing";

const LITE_QUERY = "(max-width: 767px), (prefers-reduced-motion: reduce)";
function subscribeLiteMode(callback: () => void) {
  const mq = window.matchMedia(LITE_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getLiteModeSnapshot() {
  return window.matchMedia(LITE_QUERY).matches;
}
function getLiteModeServerSnapshot() {
  return false;
}

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  delay: (i % 7) * 0.6,
  duration: 8 + (i % 5) * 2,
  size: 2 + (i % 3),
}));

const DRIFT_PLANES = [
  { id: 0, top: "15%", duration: 22, delay: 0, rotate: 35 },
  { id: 1, top: "62%", duration: 28, delay: 8, rotate: 35 },
  { id: 2, top: "40%", duration: 25, delay: 16, rotate: 35 },
];

// This page renders before any locale is chosen, so each card's own "select
// this language" prompt is hardcoded per-locale here rather than pulled from
// the translation dictionaries (which need a locale to already be known).
const SELECT_LABELS: Partial<Record<Locale, string>> = {
  th: "เลือกภาษานี้",
  en: "Select this language",
  fr: "Choisir cette langue",
  de: "Diese Sprache wählen",
  ja: "この言語を選択",
  es: "Seleccionar este idioma",
};

export default function LanguageLandingMotion({
  locales,
  localeLabels,
  localeImages,
  taglines,
  siteName,
  companyName,
  logoUrl,
  year,
}: {
  locales: readonly Locale[];
  localeLabels: Record<Locale, string>;
  localeImages: Record<Locale, string>;
  taglines: Partial<Record<Locale, string>>;
  siteName: string;
  companyName: string;
  logoUrl?: string;
  year: number;
}) {
  // The full set of decorative animations below (blurred glow orbs, moving
  // grid, floating particles, drifting planes, per-card glow pulses) is a
  // lot of concurrent, infinitely-repeating framer-motion animations —
  // fine on a desktop GPU, but a real, measurable drag on phones (blur
  // filters especially are expensive on mobile GPUs). `lite` skips the
  // filter/blur-heavy layers and cuts the particle/plane counts on small
  // screens and for people who've asked their OS for reduced motion.
  const lite = useSyncExternalStore(subscribeLiteMode, getLiteModeSnapshot, getLiteModeServerSnapshot);

  const particles = lite ? PARTICLES.slice(0, 6) : PARTICLES;
  const driftPlanes = lite ? [] : DRIFT_PLANES;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-jade-dark)] text-white">
      {/* Slowly shifting gradient wash for a "digital" living background */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 15%, color-mix(in srgb, var(--color-gold) 14%, transparent) 0%, transparent 60%), radial-gradient(55% 45% at 85% 85%, color-mix(in srgb, var(--color-jade) 22%, transparent) 0%, transparent 60%)",
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Faint moving grid — reads as "digital" without being loud. Static
          on mobile/reduced-motion since the animated backgroundPosition
          forces a repaint every frame. */}
      {lite ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      ) : (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "48px 48px"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Drifting glow orbs — blur() is one of the more GPU-expensive CSS
          filters, so these are desktop-only. */}
      {!lite && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[var(--color-gold)]/20 blur-[100px]"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[var(--color-jade)]/30 blur-[110px]"
            animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Flight routes — dashed curves connecting "destinations", like a route map */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden viewBox="0 0 1000 700" preserveAspectRatio="none">
        {[
          { d: "M 80 120 Q 350 40 620 160 T 950 100", delay: 0 },
          { d: "M 40 500 Q 300 620 560 520 T 960 560", delay: 1.5 },
          { d: "M 150 300 Q 400 260 650 340 T 900 300", delay: 3 },
        ].map((route, i) => (
          <motion.path
            key={i}
            d={route.d}
            fill="none"
            stroke="var(--color-gold)"
            strokeOpacity={0.25}
            strokeWidth={1.5}
            strokeDasharray="6 8"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, delay: route.delay, ease: "easeInOut" }}
          />
        ))}
      </svg>
      {/* Pulsing destination pins along the routes */}
      {[
        { left: "8%", top: "17%" },
        { left: "62%", top: "23%" },
        { left: "95%", top: "14%" },
        { left: "4%", top: "71%" },
        { left: "56%", top: "74%" },
        { left: "15%", top: "43%" },
        { left: "65%", top: "48%" },
      ].map((pin, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-[var(--color-gold-light)]"
          style={{ left: pin.left, top: pin.top }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}

      {/* Small planes drifting across the sky along the routes. Animates a
          transform (x) instead of the `left` CSS property — `left` forces a
          layout recalculation on every frame, transforms don't. */}
      {driftPlanes.map((p) => (
        <motion.div
          key={p.id}
          aria-hidden
          className="pointer-events-none absolute text-[var(--color-gold-light)]/30"
          style={{ top: p.top, left: "-5%" }}
          animate={{ x: ["0%", "1150%"], opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          <Plane size={16} style={{ transform: `rotate(${p.rotate}deg)` }} />
        </motion.div>
      ))}

      {/* Floating particles — tiny embers drifting upward */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-[var(--color-gold-light)]/50"
          style={{ left: `${p.left}%`, bottom: "-10px", width: p.size, height: p.size }}
          animate={{ y: [0, -700], opacity: [0, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Fixed top-center brand name */}
      <motion.div
        className="relative z-10 flex items-center justify-center pt-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span className="font-display text-3xl font-semibold tracking-tight">{siteName}</span>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center px-5 pb-16 pt-10">
        {/* Radar / compass centerpiece */}
        <div className="relative flex h-32 w-32 items-center justify-center">
          {[0, 1, 2].map((ring) => (
            <motion.span
              key={ring}
              className="absolute rounded-full border border-[var(--color-gold)]/40"
              style={{ width: "100%", height: "100%" }}
              animate={{ scale: [0.5, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: ring * 1, ease: "easeOut" }}
            />
          ))}
          <motion.div
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-light)] text-[var(--color-jade-dark)] shadow-lg shadow-black/30"
            animate={logoUrl ? { scale: [1, 1.08, 1] } : { rotate: 360 }}
            transition={
              logoUrl
                ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
                : { duration: 12, repeat: Infinity, ease: "linear" }
            }
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-full w-full object-cover" />
            ) : (
              <Plane size={26} strokeWidth={2} />
            )}
          </motion.div>
        </div>

        <motion.div
          className="mt-4 h-px w-24 origin-center bg-[var(--color-gold)]/40"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        />

        <motion.p
          className="mt-8 bg-gradient-to-r from-[var(--color-sand)] via-[var(--color-gold-light)] to-[var(--color-sand)] bg-[length:200%_auto] bg-clip-text text-center font-display text-2xl font-semibold text-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, backgroundPosition: ["0% center", "200% center"] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.5 },
            y: { duration: 0.6, delay: 0.5 },
            backgroundPosition: { duration: 5, repeat: Infinity, ease: "linear", delay: 1 },
          }}
        >
          เลือกภาษาของคุณ <span className="text-[var(--color-gold-light)]">/</span> Choose your language
        </motion.p>

        {/* grid-cols-6 below matches the current number of languages (see
            i18n/routing.ts locales) so all cards sit in one row on desktop —
            bump this class too when adding another language. */}
        <div className="relative mt-10 grid w-full max-w-5xl grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-6">
          {locales.map((locale, i) => (
            <motion.div
              key={locale}
              initial={{ opacity: 0, y: 32, rotate: i % 2 === 0 ? -3 : 3, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 + i * 0.09, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={{ y: -8, scale: 1.04, rotate: 0 }}
              style={{ perspective: 800 }}
            >
              <Link
                href={`/${locale}`}
                className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-jade-dark)] shadow-lg shadow-black/20 transition-colors duration-300 hover:border-[var(--color-gold)]/70"
              >
                {/* Idle glow pulse around the card border. Animating a
                    pre-set box-shadow's opacity is compositor-only (cheap);
                    animating the box-shadow value itself (the old approach)
                    forces a paint on every single frame — expensive with
                    six of these running at once, especially on phones. */}
                {!lite && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -inset-px rounded-2xl"
                    style={{ boxShadow: "0 0 18px rgba(212,175,55,0.35)" }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                  />
                )}

                <div className="relative h-28 w-full overflow-hidden sm:h-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={localeImages[locale]}
                    alt={localeLabels[locale]}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {/* Shine sweep on hover */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  {/* Boarding-pass destination code */}
                  <span className="absolute left-2 top-2 rounded-md bg-black/40 px-1.5 py-0.5 font-mono-data text-[9px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                    {locale}-01
                  </span>
                </div>

                {/* Perforated ticket divider with cutout notches + plane badge */}
                <div className="relative h-0 border-t border-dashed border-white/25">
                  <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-[var(--color-jade-dark)]" />
                  <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-[var(--color-jade-dark)]" />
                  <span className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[var(--color-jade-dark)] text-[var(--color-gold-light)]">
                    <Plane size={11} strokeWidth={2.2} />
                  </span>
                </div>

                <div className="relative px-3 pb-3 pt-4 text-center">
                  <p className="font-display text-base font-semibold transition-colors duration-300 group-hover:text-[var(--color-gold-light)]">
                    {localeLabels[locale]}
                  </p>
                  <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-[var(--color-sand)]/60">
                    <MapPin size={10} className="flex-shrink-0" /> {taglines[locale] || ""}
                  </p>

                  {/* Enticing call-to-action, revealed on hover */}
                  <div className="mt-1.5 flex h-4 items-center justify-center gap-1 text-[11px] font-medium text-[var(--color-gold-light)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span>{SELECT_LABELS[locale] || SELECT_LABELS.en}</span>
                    <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                      <ArrowRight size={12} />
                    </motion.span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-12 text-center text-xs text-[var(--color-sand)]/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 + locales.length * 0.09 + 0.3 }}
        >
          © {year} {companyName}
        </motion.p>
      </div>
    </div>
  );
}
