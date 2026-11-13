import { Section } from "@/components/ui/section";

export const metadata = {
  title: "O Vorazes | Planejamento e simulação tributária",
  description: "Entenda o que é o Vorazes e como ele apoia o planejamento tributário.",
};

const categorias = [
  { title: "Planejamento", description: "Organize dados fiscais e antecipe cenários." },
  { title: "Simulação", description: "Compare regimes tributários com base nos seus dados." },
  { title: "Análise", description: "Entenda o detalhamento por tributo e por regime." },
  { title: "Tomada de decisão", description: "Use a análise como apoio, com clareza." },
];

export default function SobrePage() {
  return (
    <Section className="pt-16">
      <h1 className="font-display text-4xl">O que é o Vorazes?</h1>
      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <div className="space-y-4 text-[var(--text-muted)]">
          <p>
            O Vorazes é um software voltado para planejamento e simulação
            tributária. Ele existe para ajudar contadores, escritórios de
            contabilidade e empresas a organizar informações fiscais e
            comparar cenários de tributação de forma mais clara.
          </p>
          <p>
            O sistema não substitui a orientação de um contador, advogado ou
            consultor tributário habilitado — ele é uma ferramenta de
            tecnologia para apoiar essas decisões com mais dados e organização.
          </p>
          <p>
            Simular diferentes regimes antes de decidir ajuda a entender, na
            prática, como cada cenário se comporta diante do faturamento, do
            setor de atividade e da estrutura da empresa.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {categorias.map((c) => (
            <div
              key={c.title}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <p className="font-medium">{c.title}</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
