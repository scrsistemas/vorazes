import { NextRequest, NextResponse } from "next/server";
import { getSubscription } from "@/lib/subscriptions";
import { plans } from "@/config/plans";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const noStore = { headers: { "Cache-Control": "no-store" } };

// Consulta o status da assinatura de um e-mail. Usado para decidir se o
// cliente pode baixar/acessar o sistema — só retorna acesso liberado quando
// o PagBank confirmou o pagamento (via webhook) e o status é "aprovado".
export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`status:${ip}`, 30, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações. Aguarde um momento e tente novamente." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const email = (request.nextUrl.searchParams.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "E-mail obrigatório." },
      { status: 400, ...noStore }
    );
  }

  const subscription = getSubscription(email);
  if (!subscription) {
    return NextResponse.json({
      ativa: false,
      status: "inexistente",
      plano: null,
      atualizadoEm: null,
    });
  }

  const plan = plans.find((p) => p.id === subscription.planId);

  return NextResponse.json(
    {
      ativa: subscription.status === "aprovado",
      status: subscription.status,
      plano: plan ? { id: plan.id, nome: plan.name } : null,
      atualizadoEm: subscription.updatedAt,
    },
    noStore
  );
}