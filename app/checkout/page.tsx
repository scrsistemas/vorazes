"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Section } from "@/components/ui/section";
import { plans } from "@/config/plans";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");
  const plan = plans.find((p) => p.id === planId);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!plan) {
    return (
      <Section className="pt-16">
        <h1 className="font-display text-3xl">Plano não encontrado</h1>
        <p className="mt-4 text-[var(--text-muted)]">
          Volte para a página de planos e escolha uma opção válida.
        </p>
      </Section>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan!.id,
          customerName: name,
          customerEmail: email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Não foi possível processar o pedido.");
        setLoading(false);
        return;
      }

      if (data.checkoutUrl) {
        // Integração real: redireciona o cliente para a página de
        // pagamento hospedada do PagBank.
        window.location.assign(data.checkoutUrl);
        return;
      }

      // Modo mock (PAGSEGURO_ENV=mock): pula direto para a confirmação,
      // só para testar o fluxo de UI.
      router.push(
        `/confirmacao?status=${data.status}&plan=${plan!.id}&order=${data.orderId}&email=${encodeURIComponent(email)}`
      );
    } catch {
      setError("Não foi possível conectar ao servidor de pagamento.");
      setLoading(false);
    }
  }

  return (
    <Section className="pt-16">
      <h1 className="font-display text-3xl">Revisar assinatura</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="font-medium">{plan.name}</p>
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
            {plan.installments}x de {formatPrice(plan.price)} sem juros no
            cartão
          </p>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Contrato de {plan.contractMonths} meses de acesso, sem
            cancelamento durante o período.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="name">
              Nome completo
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Use um e-mail real e acessível — é com ele que você verifica e
              baixa o sistema.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <p className="text-xs text-[var(--text-muted)]">
            O pagamento é processado pelo PagBank. Nenhum dado de cartão é
            armazenado pelo Vorazes. O valor de {formatPrice(plan.total)} é
            cobrado em uma única compra, parcelado em até {plan.installments}x
            de {formatPrice(plan.price)} sem juros no cartão. O contrato tem
            duração de {plan.contractMonths} meses e não pode ser cancelado
            durante o período.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-medium text-[#10150f] hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Processando..." : "Ir para pagamento"}
          </button>
        </form>
      </div>
    </Section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}