import { Section } from "@/components/ui/section";
import { faqItems } from "@/config/faq";

export const metadata = {
  title: "Suporte | Vorazes",
  description: "Entre em contato com o suporte do Vorazes.",
};

const contato = {
  email: "suporte@vorazes.com.br",
  whatsapp: "",
};

export default function SuportePage() {
  return (
    <>
      <Section className="pt-16">
        <h1 className="font-display text-4xl">Suporte</h1>
        <p className="mt-4 max-w-[60ch] text-[var(--text-muted)]">
          Precisa de ajuda? Fale com a gente por um dos canais abaixo.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="font-medium">E-mail</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {contato.email}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="font-medium">Formulário de contato</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Em breve disponível diretamente por aqui.
            </p>
          </div>
        </div>
      </Section>

      <Section className="border-t border-[var(--border)]">
        <h2 className="font-display text-3xl">Perguntas frequentes</h2>
        <div className="mt-8 divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {faqItems.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left font-medium">
                {item.question}
                <span className="text-[var(--text-muted)] group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
