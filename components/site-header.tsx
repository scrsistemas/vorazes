import Link from "next/link";

const navItems = [
  { href: "/sobre", label: "O Vorazes" },
  { href: "/recursos", label: "Recursos" },
  { href: "/videos", label: "Vídeos" },
  { href: "/downloads", label: "Downloads" },
  { href: "/planos", label: "Planos" },
  { href: "/suporte", label: "Suporte" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl tracking-tight">
          Vorazes
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/planos"
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#10150f] transition-opacity hover:opacity-90"
        >
          Conhecer planos
        </Link>
      </div>
    </header>
  );
}
