import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface LegalPageProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-[3px] w-full bg-gradient-to-r from-primary to-accent" aria-hidden="true" />

      <header className="border-b border-card-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="text-[14px] font-extrabold text-foreground">chambaverificada</span>
          </Link>
          <Link
            href="/"
            className="rounded text-[13px] font-semibold text-foreground-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 py-10 md:py-16">
        <h1 className="mb-1.5 text-[24px] font-extrabold text-foreground md:text-[28px]">{title}</h1>
        <p className="mb-8 text-[12.5px] text-foreground-muted">Última actualización: {updated}</p>

        <div className="legal-content flex flex-col gap-6 text-[14px] leading-relaxed text-foreground">
          {children}
        </div>
      </main>

      <style>{`
        .legal-content h2 { font-size: 17px; font-weight: 800; margin-bottom: 8px; }
        .legal-content p, .legal-content li { color: var(--foreground-muted); }
        .legal-content p + p { margin-top: 10px; }
        .legal-content ul { display: flex; flex-direction: column; gap: 6px; padding-left: 20px; list-style: disc; margin-top: 6px; }
        .legal-content strong { color: var(--foreground); font-weight: 600; }
      `}</style>
    </div>
  );
}
