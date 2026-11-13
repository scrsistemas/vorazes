import Link from "next/link";

const columns = [
  {
    title: "Produto",
    links: [
      { href: "/recursos", label: "Recursos" },
      { href: "/videos", label: "Vídeos" },
      { href: "/downloads", label: "Downloads" },
      { href: "/planos", label: "Planos e preços" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/sobre", label: "O Vorazes" },
      { href: "/suporte", label: "Suporte" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/termos", label: "Termos de uso" },
      { href: "/privacidade", label: "Política de privacidade" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div>
            <p className="font-display text-lg">Vorazes</p>
            <p className="mt-3 max-w-[22ch] text-sm text-[var(--text-muted)]">
              Planejamento tributário com tecnologia e análise.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium text-[var(--text)]">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} Vorazes. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
