"use client";

import { motion } from "motion/react";
import { AnimatedShieldCheck } from "./icons/AnimatedShieldCheck";
import { AnimatedCheck } from "./icons/AnimatedCheck";
import { AnimatedAlert } from "./icons/AnimatedAlert";
import type { AnalysisResult } from "@/lib/types";

const RISK_LABEL: Record<AnalysisResult["risk"], string> = {
  low: "bajo",
  medium: "medio",
  high: "alto",
};

const RISK_TEXT_CLASS: Record<AnalysisResult["risk"], string> = {
  low: "text-risk-low-text",
  medium: "text-risk-medium-text",
  high: "text-risk-high-text",
};

interface ResultCardProps {
  result: AnalysisResult;
  onRetry: () => void;
}

export function ResultCard({ result, onRetry }: ResultCardProps) {
  return (
    <motion.div
      key={JSON.stringify(result)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[18px] border border-card-border bg-card p-5 shadow-[0_1px_3px_rgba(61,40,117,0.08)]"
    >
      <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        Resultado del análisis
      </div>

      <div className="mb-5 flex items-center gap-3">
        <AnimatedShieldCheck risk={result.risk} />
        <div className="text-[17.5px] font-bold text-foreground">
          Riesgo <span className={RISK_TEXT_CLASS[result.risk]}>{RISK_LABEL[result.risk]}</span>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-2.5">
        {result.reasons.map((reason, i) => (
          <motion.div
            key={reason.text}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.5 + i * 0.12 }}
            className="flex items-start gap-2.5 text-[13px] leading-[1.45] text-foreground"
          >
            {reason.type === "positive" ? (
              <AnimatedCheck delay={0.55 + i * 0.12} />
            ) : (
              <AnimatedAlert
                delay={0.55 + i * 0.12}
                color={result.risk === "high" ? "var(--risk-high)" : "var(--risk-medium)"}
              />
            )}
            <span>{reason.text}</span>
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="h-[42px] w-full rounded-[10px] border border-card-border bg-transparent text-[13.5px] font-bold text-on-tint transition-colors hover:bg-primary-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Verificar otra oferta
      </button>
    </motion.div>
  );
}
