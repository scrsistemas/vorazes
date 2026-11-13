"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Section } from "@/components/ui/section";
import { plans } from "@/config/plans";

const statusConfig = {
  aprovado: {
    title: "Pagamento confirmado",
    message: "Obrigado por assinar o Vorazes.",
  },
  pendente: {
    title: "Aguardando confirmação",
    message:
      "Estamos aguardando o banco confirmar o pagamento. Esta página atualiza automaticamente.",
  },
  recusado: {
    title: "Pagamento não aprovado",
    message: "Não foi possível confirmar o pagamento. Tente novamente.",
  },
  cancelado: {
    title: "Pagamento cancelado",
    message: "O pagamento foi cancelado.",
  },
} as const;

type StatusKey = keyof typeof statusConfig;

const FINAL_STATUS: StatusKey[] = ["aprovado", "recusado", "cancelado"];

function ConfirmacaoContent() {
  const searchParams = useSearchParams();
  const queryStatus = (searchParams.get("status") ??
    "pendente") as StatusKey;
  const planId = searchParams.get("plan");
  const orderId = searchParams.get("order");
  const email = searchParams.get("email");
  const plan = plans.find((p) => p.id === planId);

  const [status, setStatus] = useState<StatusKey>(
    statusConfig[queryStatus] ? queryStatus : "pendente"
  );

  useEffect(() => {
    if (!email || FINAL_STATUS.includes(status)) return;

    let tentativas = 0;

    const timer = setInterval(async () => {
      tentativas += 1;
      try {
        const res = await fetch(
          `/api/assinatura/status?email=${encodeURIComponent(email)}`
        );
        const data = await res.json();
        if (FINAL_STATUS.includes(data.status)) {
          setStatus(data.status);
        } else if (tentativas >= 10) {
          clearInterval(timer);
        }
      } catch {
        if (tentativas >= 10) clearInterval(timer);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [email, status]);

  const config = statusConfig[status] ?? statusConfig.pendente;

  return (
    <Section className="pt-16 text-center">
      <h1 className="font-display text-4xl">{config.title}</h1>
      <p className="mt-4 text-[var(--text-muted)]">{config.message}</p>

      {plan && (
        <div className="mx-auto mt-10 max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">Plano</span>
            <span>{plan.name}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">Valor</span>
            <span>
              {plan.installments}x R$ {plan.price.toLocaleString("pt-BR")} · R${" "}
              {plan.total.toLocaleString("pt-BR")}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">Status</span>
            <span className="capitalize">{status}</span>
          </div>
          {orderId && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Pedido</span>
              <span className="text-xs">{orderId}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 flex justify-center gap-4">
        {status === "aprovado" ? (
          <Link
            href="/downloads"
            className="rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[#10150f] hover:opacity-90"
          >
            Baixar o Vorazes
          </Link>
        ) : (
          <Link
            href="/planos"
            className="rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[#10150f] hover:opacity-90"
          >
            Voltar para planos
          </Link>
        )}
        <Link
          href="/suporte"
          className="rounded-md border border-[var(--border)] px-6 py-3 text-sm font-medium hover:bg-[var(--surface)]"
        >
          Falar com suporte
        </Link>
      </div>
    </Section>
  );
}

export default function ConfirmacaoPage() {
  return (
    <Suspense>
      <ConfirmacaoContent />
    </Suspense>
  );
}