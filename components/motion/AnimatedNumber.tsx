"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

/** Splits "10,000+" into prefix "", number 10000, suffix "+" so we can animate
 *  just the numeric part and re-attach the original formatting/decoration. */
function parseValue(raw: string): { prefix: string; number: number | null; suffix: string } {
  const match = raw.match(/^(\D*)([\d,]+(?:\.\d+)?)(\D*)$/);
  if (!match) return { prefix: "", number: null, suffix: raw };
  const [, prefix, numStr, suffix] = match;
  return { prefix, number: Number(numStr.replace(/,/g, "")), suffix };
}

export default function AnimatedNumber({ value, duration = 1.4 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const { prefix, number, suffix } = parseValue(value);
  const [display, setDisplay] = useState(number === null ? value : "0");

  useEffect(() => {
    if (!inView || number === null) return;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * number);
      setDisplay(current.toLocaleString());
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, number, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
