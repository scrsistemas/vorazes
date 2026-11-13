import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";

const recursos = [
  {
    title: "Simulações tributárias",
    description:
      "Compare Simples Nacional, Lucro Presumido e Lucro Real lado a lado, com base nos dados da sua empresa.",
  },
  {
    title: "Importação de XML",
    description:
      "Organize automaticamente suas notas de compra e venda por competência mensal.",
  },
  {
    title: "Histórico de simulações",
    description:
      "Consulte simulações anteriores por cliente e acompanhe a evolução ao longo do tempo.",
  },
  {
    title: "Análise CBS/IBS",
    description:
      "Acompanhe o impacto da reforma tributária nos cenários simulados.",
    planned: true,
  },
  {
    title: "Relatórios",
    description:
      "Exporte os resultados das simulações para compartilhar com sua equipe ou clientes.",
    planned: true,
  },
  {
    title: "Múltiplos clientes",
    description:
      "Cadastre quantos clientes forem necessários e alterne entre eles a qualquer momento.",
  },
];

const passos = [
  { title: "Informe os dados", description: "Faturamento, setor e demais informações da empresa." },
  { title: "Configure o cenário", description: "Ajuste os parâmetros que fazem sentido para o caso." },
  { title: "Execute a simulação", description: "O Vorazes compara os regimes tributários disponíveis." },
  { title: "Analise os resultados", description: "Veja o detalhamento por tributo e por regime." },
  { title: "Tome decisões", description: "Use a análise como apoio ao planejamento tributário." },
];

export default function Home() {
  return (
    <>
      <Section className="pt-16 md:pt-24">
        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <Badge>Software de planejamento tributário</Badge>
            <h1 className="font-display mt-6 text-4xl leading-[1.1] italic md:text-6xl">
              Planejamento tributário mais inteligente para sua empresa.
            </h1>
          </div>
          <div className="md:pb-2">
            <p className="text-lg text-[var(--text-muted)]">
              Analise cenários, simule impactos tributários e tome decisões
              com mais clareza. O Vorazes reúne simulação, organização fiscal
              e histórico em um só lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/sobre"
                className="rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[#10150f] hover:opacity-90"
              >
                Conheça o Vorazes
              </Link>
              <Link
                href="/planos"
                className="rounded-md border border-[var(--border)] px-6 py-3 text-sm font-medium hover:bg-[var(--surface)]"
              >
                Ver planos
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
            <span className="ml-3 text-xs text-[var(--text-muted)]">
              Vorazes — Dashboard
            </span>
          </div>
          <div className="grid gap-4 p-8 md:grid-cols-3">
            {[
              ["Simulações realizadas", "128"],
              ["Economia média estimada", "14,3%"],
              ["Regime mais simulado", "Lucro Presumido"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-5"
              >
                <p className="text-xs text-[var(--text-muted)]">{label}</p>
                <p className="font-display mt-2 text-2xl">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="sobre" className="border-t border-[var(--border)]">
        <div className="grid gap-12 md:grid-cols-2">
          <h2 className="font-display text-3xl">O que é o Vorazes?</h2>
          <div className="space-y-4 text-[var(--text-muted)]">
            <p>
              O Vorazes é uma ferramenta de análise e simulação tributária.
              Ele ajuda a organizar dados fiscais e comparar cenários de
              tributação, servindo como apoio à tomada de decisão — não como
              substituto de orientação contábil ou jurídica.
            </p>
            <p>
              Foi pensado para contadores, escritórios de contabilidade e
              empresas que precisam entender, com mais clareza, o impacto de
              diferentes regimes tributários no dia a dia do negócio.
            </p>
          </div>
        </div>
      </Section>

      <Section id="recursos" className="border-t border-[var(--border)]">
        <h2 className="font-display text-3xl">Principais recursos</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-3">
          {recursos.map((r) => (
            <div key={r.title} className="bg-[var(--surface)] p-6">
              <div className="flex items-center gap-2">
                <p className="font-medium">{r.title}</p>
                {r.planned && (
                  <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                    em breve
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-[var(--border)]">
        <h2 className="font-display text-3xl">Como funciona</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-5">
          {passos.map((p, i) => (
            <li key={p.title} className="border-t-2 border-[var(--accent)] pt-4">
              <span className="text-xs text-[var(--text-muted)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 font-medium">{p.title}</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {p.description}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="border-t border-[var(--border)] text-center">
        <h2 className="font-display text-3xl">
          Pronto para planejar com mais clareza?
        </h2>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/planos"
            className="rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[#10150f] hover:opacity-90"
          >
            Assinar agora
          </Link>
          <Link
            href="/videos"
            className="rounded-md border border-[var(--border)] px-6 py-3 text-sm font-medium hover:bg-[var(--surface)]"
          >
            Ver demonstração
          </Link>
        </div>
      </Section>
    </>
  );
}
