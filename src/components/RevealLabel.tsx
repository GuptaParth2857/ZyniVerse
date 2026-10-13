"use client";

import { createElement } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealLabelProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  delay?: number;
  /** Letter-spacing (CSS value) the label settles to. */
  spacing?: string;
  /** Starting (wider) letter-spacing for the spread-in effect. */
  fromSpacing?: string;
};

/**
 * Small mono eyebrow/kicker label with a "tracking settle" reveal:
 * the text starts wider + faded and settles into place.
 * Respects prefers-reduced-motion (renders plain markup).
 */
export default function RevealLabel({
  children,
  className,
  style,
  as = "p",
  delay = 0,
  spacing = "0.25em",
  fromSpacing = "0.45em",
}: RevealLabelProps) {
  const reduce = useReducedMotion();
  const Tag = as;

  if (reduce) {
    return createElement(Tag, { className, style }, children);
  }

  return createElement(
    Tag,
    { className, style },
    <motion.span
      className="inline-block whitespace-nowrap"
      initial={{ opacity: 0, letterSpacing: fromSpacing }}
      whileInView={{ opacity: 1, letterSpacing: spacing }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.span>,
  );
}
