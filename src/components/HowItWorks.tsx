import { ClipboardPaste, Search, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardPaste,
    title: "Pega la oferta",
    text: "Copia el texto completo: empresa, puesto, salario y requisitos.",
  },
  {
    icon: Search,
    title: "Analizamos las señales",
    text: "Revisamos empresa, rango salarial y pedidos de datos sospechosos.",
  },
  {
    icon: ShieldCheck,
    title: "Revisa el resultado",
    text: "Riesgo bajo, medio o alto, con las razones concretas detrás.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="mt-14 md:mt-20">
      <h2
        id="how-it-works-heading"
        className="mb-6 text-center text-[13px] font-bold uppercase tracking-wide text-foreground-muted"
      >
        Cómo funciona
      </h2>
      <ol className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="flex flex-col items-center rounded-[18px] border border-card-border bg-card p-6 text-center md:items-start md:text-left"
          >
            <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint">
              <step.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              {/* Number badge always uses --btn-bg (not --primary directly) — it's the
                  same token as the CTA button, verified for white-text contrast in
                  both themes; aria-hidden since the <ol> already conveys order. */}
              <span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-btn text-[10px] font-bold text-white ring-2 ring-card"
                aria-hidden="true"
              >
                {i + 1}
              </span>
            </div>
            <h3 className="mb-1.5 text-[14px] font-bold text-foreground">{step.title}</h3>
            <p className="text-[13px] leading-relaxed text-foreground-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
