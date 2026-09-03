"use client";

import { motion } from "motion/react";

interface AnimatedCheckProps {
  delay?: number;
  size?: number;
  color?: string;
}

/** Small checkmark that draws itself in — used per-reason in the result list, staggered by `delay`. */
export function AnimatedCheck({ delay = 0, size = 16, color = "var(--primary)" }: AnimatedCheckProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
      <motion.path
        d="M5 12.5 9.5 17 19 6.5"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}
