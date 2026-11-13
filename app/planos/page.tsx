import Link from "next/link";
import { Section } from "@/components/ui/section";
import { plans } from "@/config/plans";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const mainPlan = plans[0];

export const metadata = {
  title: "Planos e preços | Vorazes",
  description: `Assine o Vorazes por ${formatPrice(mainPlan.total)}/ano em ${mainPlan.installments}x de ${formatPrice(mainPlan.price)} sem juros.`,
};

export default function PlanosPage() {
  const activePlans = plans.filter((p) => p.active);

  return (
    <Section className="pt-16">
      <h1 className="font-display text-4xl">Planos e preços</h1>
      <p className="mt-4 max-w-[60ch] text-[var(--text-muted)]">
        Um único plano com acesso completo ao Vorazes: {formatPrice(mainPlan.total)}{" "}
        por ano, divididos em {mainPlan.installments} parcelas de{" "}
        {formatPrice(mainPlan.price)} sem juros no cartão.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {activePlans.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col rounded-xl border p-6 ${
              plan.highlighted
                ? "border-[var(--accent)] bg-[var(--surface)]"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            {plan.highlighted && (
              <span className="mb-4 w-fit rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-medium text-[#10150f]">
                Plano único
              </span>
            )}
            <p className="font-display text-xl">{plan.name}</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {plan.description}
            </p>

            <p className="font-display mt-6 text-2xl">
              {formatPrice(plan.total)}
              <span className="text-sm font-normal text-[var(--text-muted)]">
                {" "}
                por ano
              </span>
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              ou {plan.installments}x de {formatPrice(plan.price)} sem juros
            </p>

            <ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--text-muted)]">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-[var(--accent)]">—</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={`/checkout?plan=${plan.id}`}
              className={`mt-8 rounded-md px-4 py-2.5 text-center text-sm font-medium ${
                plan.highlighted
                  ? "bg-[var(--accent)] text-[#10150f] hover:opacity-90"
                  : "border border-[var(--border)] hover:bg-[var(--surface-2)]"
              }`}
            >
              Assinar o Vorazes
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">
        <p className="font-medium text-[var(--text)]">Como funciona a cobrança</p>
        <ul className="mt-3 space-y-2">
          <li>— Pagamento pelo PagBank, com cartão de crédito.</li>
          <li>
            — Compra única de {formatPrice(mainPlan.total)} parcelada em até{" "}
            {mainPlan.installments}x de {formatPrice(mainPlan.price)} sem juros
            no cartão.
          </li>
          <li>
            — Contrato de 12 meses de acesso: não é possível cancelar durante
            o período do contrato.
          </li>
          <li>
            — Nenhum dado de cartão é armazenado pelo Vorazes; o pagamento
            acontece na página segura do PagBank.
          </li>
        </ul>
      </div>

      <p className="mt-10 text-sm text-[var(--text-muted)]">
        Dúvidas sobre o contrato?{" "}
        <Link href="/suporte" className="text-[var(--accent)] hover:underline">
          Fale com o suporte
        </Link>
        .
      </p>
    </Section>
  );
}