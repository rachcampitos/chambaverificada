"use client";

import { motion } from "motion/react";

const RISK_COLORS = {
  low: { stroke: "var(--risk-low)", fill: "var(--risk-low-tint)" },
  medium: { stroke: "var(--risk-medium)", fill: "var(--risk-medium-tint)" },
  high: { stroke: "var(--risk-high)", fill: "var(--risk-high-tint)" },
} as const;

interface AnimatedShieldCheckProps {
  risk: "low" | "medium" | "high";
  size?: number;
}

/**
 * Shield icon whose check/alert mark draws itself via Motion's `pathLength` —
 * same base technique as heroicons-animated / lucide-animated, kept
 * deliberately restrained (no bounce, no overshoot) to match a "serious
 * verification tool" tone rather than a playful one. The outline itself is
 * static (matches the approved Claude Design prototype) — the card's own
 * entrance motion is the reveal, so animating the outline too was a second,
 * unapproved layer of motion on top of it.
 */
export function AnimatedShieldCheck({ risk, size = 34 }: AnimatedShieldCheckProps) {
  const { stroke, fill } = RISK_COLORS[risk];

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5l-8-3Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={1.6}
      />
      {risk === "high" ? (
        <>
          <motion.path
            d="M12 8v5"
            fill="none"
            stroke={stroke}
            strokeWidth={2.2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
          />
          <motion.circle
            cx={12}
            cy={16.2}
            r={0.15}
            fill={stroke}
            initial={{ scale: 0 }}
            animate={{ scale: 8 }}
            transition={{ duration: 0.15, delay: 0.62 }}
          />
        </>
      ) : (
        <motion.path
          d="M8.5 12.2 11 14.7l4.8-5.4"
          fill="none"
          stroke={stroke}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.35, ease: [0.65, 0, 0.35, 1] }}
        />
      )}
    </svg>
  );
}
