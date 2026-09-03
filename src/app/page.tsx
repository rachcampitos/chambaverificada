"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Loader2, Search, ShieldCheck } from "lucide-react";
import { ResultCard } from "@/components/ResultCard";
import { CompanyBadge } from "@/components/CompanyBadge";
import { FollowUpChat } from "@/components/FollowUpChat";
import { HowItWorks } from "@/components/HowItWorks";
import type { AnalysisResult } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";

const MAX_LENGTH = 6000;
const TEXTAREA_MAX_HEIGHT = 320;

const TRUST_CHIPS = ["Gratis", "Sin registro", "Resultado en segundos"];

const EXAMPLE_OFFER = `Frontend Developer — Remoto — Arila Business Management Ltd.
Pago S/8,500/mes, sin experiencia previa requerida.
Para procesar tu contrato, envía una copia de tu tarjeta de debito y numero de cuenta.
Cupos limitados, responde hoy mismo.`;

export default function Home() {
  const [offerText, setOfferText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const offerFieldId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea with its content (up to a cap, then it scrolls) —
  // a fixed 7-row box left long, real job offers scrolling inside a tiny window
  // right at the step where the user most needs to re-read what they pasted.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [offerText]);

  async function handleVerify() {
    if (!offerText.trim() || status === "loading") return;

    setStatus("loading");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: offerText }),
      });

      if (res.status === 429) {
        setErrorMessage("Demasiados intentos seguidos. Espera unos minutos y vuelve a intentar.");
        setStatus("error");
        return;
      }
      if (!res.ok) throw new Error(`analyze failed: ${res.status}`);

      const data: AnalysisResult = await res.json();
      setResult(data);
      setStatus("done");
    } catch {
      setErrorMessage("No pudimos analizar la oferta. Intenta de nuevo en unos segundos.");
      setStatus("error");
    }
  }

  function handleRetry() {
    setStatus("idle");
    setResult(null);
    setOfferText("");
  }

  function fillExample() {
    setOfferText(EXAMPLE_OFFER);
  }

  const isLoading = status === "loading";
  const isDone = status === "done";

  return (
    <div className="min-h-screen bg-background">
      {/* The only intentional use of --accent (terracota): a single decorative
          brand stripe, not a repeated UI element. Terracota on one of several
          identical cards read as an inconsistency/bug (a real user caught this
          on the "Cómo funciona" step icons) rather than a deliberate accent — a
          one-off flourish like this can't raise that same "which one is broken"
          question because there's only one of it. */}
      <div className="h-[3px] w-full bg-gradient-to-r from-primary to-accent" aria-hidden="true" />

      <a
        href="#offer-form"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-btn focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al formulario
      </a>

      <header className="border-b border-card-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="text-[14px] font-extrabold text-foreground">chambaverificada</span>
          </div>
          <a
            href="#how-it-works-heading"
            className="rounded text-[13px] font-semibold text-foreground-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Cómo funciona
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-10 md:py-16">
        <div className="mx-auto mb-9 max-w-xl text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            {TRUST_CHIPS.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1 rounded-full bg-primary-tint px-3 py-1 text-[11.5px] font-semibold text-on-tint"
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {chip}
              </span>
            ))}
          </div>
          <h1 className="mb-3 text-balance text-[26px] font-extrabold text-foreground md:text-[32px]">
            ¿Esta oferta de trabajo es real?
          </h1>
          <p className="text-balance text-[14px] leading-relaxed text-foreground-muted md:text-[15px]">
            Pega el texto completo de la oferta y revisamos señales de riesgo antes de que
            compartas tus datos o postules.
          </p>
        </div>

        <form
          id="offer-form"
          className="mx-auto max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
        >
          <div className="mb-2 rounded-[14px] border border-card-border bg-card p-3.5 transition-shadow focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <label
              htmlFor={offerFieldId}
              className="mb-2 block text-xs font-semibold text-foreground-muted"
            >
              Oferta de trabajo
            </label>
            <textarea
              ref={textareaRef}
              id={offerFieldId}
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              placeholder="Pega aquí el texto completo de la oferta: empresa, puesto, salario, requisitos..."
              rows={5}
              maxLength={MAX_LENGTH}
              disabled={isLoading}
              aria-describedby={`${offerFieldId}-count`}
              className="max-h-80 w-full resize-none overflow-y-auto bg-transparent text-[13px] leading-relaxed text-foreground outline-none placeholder:text-foreground-muted/60"
            />
            <div id={`${offerFieldId}-count`} className="mt-1 text-right text-[11px] text-foreground-muted/70">
              {offerText.length}/{MAX_LENGTH}
            </div>
          </div>

          <div className="mb-5 text-center">
            <button
              type="button"
              onClick={fillExample}
              disabled={isLoading}
              className="rounded text-[12.5px] font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ¿No tienes una oferta a mano? Probar con un ejemplo
            </button>
          </div>

          {/* Once there's a result, ResultCard's own "Verificar otra oferta" is the
              single reset action — keeping this button too invited two ways to
              "verify again" that quietly did different things (re-run the same
              text vs. clear the field). */}
          {!isDone && (
            <button
              type="submit"
              disabled={!offerText.trim() || isLoading}
              aria-busy={isLoading}
              className="mb-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-btn text-[14.5px] font-bold text-white transition-colors hover:bg-btn-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
              {isLoading ? "Analizando..." : "Verificar oferta"}
            </button>
          )}

          <div aria-live="polite" aria-atomic="true">
            {status === "error" && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-risk-high/30 bg-risk-high-tint px-4 py-3 text-[13px] text-risk-high-text"
              >
                {errorMessage}
              </div>
            )}

            {isDone && result && (
              <>
                <CompanyBadge company={result.company} />
                <ResultCard result={result} onRetry={handleRetry} />
                <FollowUpChat offerText={offerText} result={result} />
              </>
            )}
          </div>
        </form>

        <HowItWorks />

        <footer className="mt-14 text-center text-[11px] text-foreground-muted/70">
          chambaverificada no reemplaza tu propio criterio. Ante duda, no compartas datos
          personales ni bancarios.
        </footer>
      </main>
    </div>
  );
}
