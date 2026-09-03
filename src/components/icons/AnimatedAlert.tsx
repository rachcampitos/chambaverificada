"use client";

import { motion } from "motion/react";

interface AnimatedAlertProps {
  delay?: number;
  size?: number;
  color?: string;
}

/** Small exclamation mark that draws itself in — used per-reason when the signal is a warning, not a confirmation. */
export function AnimatedAlert({ delay = 0, size = 16, color = "var(--risk-medium)" }: AnimatedAlertProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
      <motion.path
        d="M12 5v9"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.2, delay, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.circle
        cx={12}
        cy={18}
        r={0.15}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 8 }}
        transition={{ duration: 0.12, delay: delay + 0.22 }}
      />
    </svg>
  );
}
