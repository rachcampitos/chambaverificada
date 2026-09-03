"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, X } from "lucide-react";
import type { CompanyInfo } from "@/lib/types";

interface CompanySheetProps {
  company: Extract<CompanyInfo, { found: true }>;
  open: boolean;
  onClose: () => void;
}

const FIELDS: Array<{ label: string; key: "ruc" | "estado" | "condicion" }> = [
  { label: "RUC", key: "ruc" },
  { label: "Estado", key: "estado" },
  { label: "Condición", key: "condicion" },
];

export function CompanySheet({ company, open, onClose }: CompanySheetProps) {
  // Escape closes it — a sheet with no keyboard way out is a trap, not a detail view.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/45"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="company-sheet-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[380px] flex-col border-l border-card-border bg-card"
          >
            <div className="flex items-start justify-between border-b border-card-border p-5">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-risk-low-tint">
                  <Building2 className="h-[22px] w-[22px] text-risk-low" aria-hidden="true" />
                </div>
                <div id="company-sheet-title" className="mb-1 text-[17px] font-extrabold leading-tight text-foreground">
                  {company.razonSocial}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-risk-low-tint px-2.5 py-1 text-[11px] font-bold text-risk-low-text">
                  ✓ Activa en SUNAT
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-foreground-muted transition-colors hover:bg-primary-tint-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto p-5">
              {FIELDS.map((field) => (
                <div key={field.key}>
                  <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-foreground-muted">
                    {field.label}
                  </div>
                  <div className="text-[14px] leading-relaxed text-foreground">{company[field.key]}</div>
                </div>
              ))}
            </div>

            <div className="mt-auto border-t border-card-border p-5 text-[11px] leading-relaxed text-foreground-muted">
              Datos del padrón público de SUNAT, actualizado a diario.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
