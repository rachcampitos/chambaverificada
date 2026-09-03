"use client";

import { motion } from "motion/react";
import { Building2, TriangleAlert } from "lucide-react";
import type { CompanyInfo } from "@/lib/types";

interface CompanyBadgeProps {
  company: CompanyInfo | null;
}

// A factual SUNAT lookup, not the AI's own reasoning — kept as its own card
// above the result on purpose (see the approved Claude Design mockup): a
// building icon instead of the risk shield, so "empresa real" never reads as
// "oferta segura" — a real company can still post a risky offer.
export function CompanyBadge({ company }: CompanyBadgeProps) {
  if (!company) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`mb-3 flex items-start gap-3 rounded-[18px] border p-4 ${
        company.found
          ? "border-risk-low/30 bg-risk-low-tint"
          : "border-risk-high/30 bg-risk-high-tint"
      }`}
    >
      {company.found ? (
        <Building2 className="mt-0.5 h-[30px] w-[30px] shrink-0 text-risk-low" aria-hidden="true" />
      ) : (
        <TriangleAlert className="mt-0.5 h-[30px] w-[30px] shrink-0 text-risk-high" aria-hidden="true" />
      )}

      {company.found ? (
        <div>
          <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-risk-low-text">
            Empresa verificada en SUNAT
          </div>
          <div className="mb-0.5 text-[14px] font-bold text-foreground">{company.razonSocial}</div>
          <div className="text-[12px] text-foreground-muted">
            RUC {company.ruc} · <b className="font-semibold text-foreground">{company.estado}</b> ·{" "}
            <b className="font-semibold text-foreground">{company.condicion}</b>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-risk-high-text">
            No se pudo verificar en SUNAT
          </div>
          <div className="mb-0.5 text-[14px] font-bold text-foreground">RUC {company.ruc}</div>
          <div className="text-[12px] text-foreground-muted">
            El número no aparece en el registro de SUNAT — señal de riesgo por sí sola.
          </div>
        </div>
      )}
    </motion.div>
  );
}
