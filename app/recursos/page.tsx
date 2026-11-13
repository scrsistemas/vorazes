import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Recursos | Vorazes",
  description: "Conheça os recursos do Vorazes em detalhes.",
};

const recursos = [
  {
    title: "Simulações tributárias",
    description:
      "Simule Simples Nacional, Lucro Presumido e Lucro Real ao mesmo tempo, com detalhamento por tributo (ICMS, PIS, COFINS, IRPJ, CSLL, ISS, conforme aplicável).",
  },
  {
    title: "Importação de XML",
    description:
      "Importe XMLs de NF-e de compras e vendas. O sistema organiza automaticamente as notas por competência mensal.",
  },
  {
    title: "Histórico de simulações",
    description:
      "Consulte simulações anteriores por empresa/cliente, com data e resultado de cada uma.",
  },
  {
    title: "Múltiplos clientes",
    description:
      "Cadastre quantos clientes forem necessários dentro da sua conta e alterne entre eles quando precisar.",
  },
  {
    title: "Dashboard",
    description:
      "Acompanhe indicadores gerais: total de simulações, economia média estimada e comparativo entre regimes.",
  },
  {
    title: "Análise CBS/IBS",
    description:
      "Funcionalidade planejada para acompanhar o impacto da reforma tributária nas simulações.",
    planned: true,
  },
];

export default function RecursosPage() {
  return (
    <Section className="pt-16">
      <h1 className="font-display text-4xl">Principais recursos</h1>
      <p className="mt-4 max-w-[60ch] text-[var(--text-muted)]">
        Tudo o que o Vorazes oferece hoje — e o que está planejado para
        próximas versões.
      </p>

      <div className="mt-12 space-y-6">
        {recursos.map((r) => (
          <div
            key={r.title}
            className="flex flex-col gap-2 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-baseline sm:justify-between"
          >
            <p className="font-medium">
              {r.title}
              {r.planned && (
                <span className="ml-2 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                  em breve
                </span>
              )}
            </p>
            <p className="max-w-[50ch] text-sm text-[var(--text-muted)]">
              {r.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
