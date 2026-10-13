"use client";

import { createElement } from "react";
import { motion, useReducedMotion } from "framer-motion";

type RevealTitleProps = {
  /** Plain text title — reveals word-by-word (mask rise). */
  text?: string;
  /** Arbitrary children — reveals as a single fade-up group. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  delay?: number;
  once?: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-triggered section title reveal.
 * - `text` mode: each word rises out of an overflow mask (premium look).
 * - `children` mode: a soft fade + rise for complex titles.
 * Respects prefers-reduced-motion and renders plain markup for it.
 */
export default function RevealTitle({
  text,
  children,
  className,
  style,
  as = "h2",
  delay = 0,
  once = true,
}: RevealTitleProps) {
  const reduce = useReducedMotion();
  const Tag = as;

  if (reduce) {
    return createElement(Tag, { className, style }, text ?? children);
  }

  if (text != null) {
    const words = text.split(" ");
    return createElement(
      Tag,
      { className, style, "aria-label": text },
      words.map((w, i) => (
        // The in-view observer lives on the (untranslated) mask span so it is
        // never clipped by `overflow-hidden`; the inner span animates the word.
        <motion.span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once, margin: "-40px" }}
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "115%", opacity: 0.01 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ duration: 0.55, ease: EASE, delay: delay + i * 0.05 }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </motion.span>
      )),
    );
  }

  return createElement(
    Tag,
    { className, style },
    <motion.span
      className="inline-block"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.span>,
  );
}