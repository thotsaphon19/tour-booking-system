"use client";

import { motion, type Variants } from "motion/react";

type Direction = "up" | "down" | "left" | "right" | "none";

const distanceFor: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: 28 },
  right: { x: -28 },
  none: {},
};

/**
 * Wraps children in a fade + slide reveal that plays once when it scrolls
 * into view. Use `delay` to stagger a group of siblings (e.g. cards in a
 * grid) so they cascade in rather than popping in all at once.
 */
export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  duration = 0.55,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  duration?: number;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const offset = distanceFor[direction];
  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  const MotionTag = motion[Tag];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </MotionTag>
  );
}
