import type { ReactNode } from "react";

// Componentes de tipografia para páginas legais (termos, privacidade).
// Mantêm o mesmo padrão visual das demais páginas do site.

export function LegalHeader({
  title,
  updatedAt,
}: {
  title: string;
  updatedAt: string;
}) {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        Última atualização: {updatedAt}
      </p>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-[var(--text-muted)]">
      {children}
    </p>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-muted)]">
      {children}
    </ul>
  );
}
