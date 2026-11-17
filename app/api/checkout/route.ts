import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/pagseguro";
import { plans } from "@/config/plans";
import { upsertSubscription } from "@/lib/subscriptions";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Rota server-side responsável por criar o pedido/checkout no PagBank.
// A validação de status de pagamento real acontece pelo webhook + consulta
// à API (fetchCheckoutStatus), nunca apenas pelo retorno direto desta rota.
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`checkout:${ip}`, 10, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações. Aguarde um momento e tente novamente." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const body = await request.json();
  const { planId, customerName, customerEmail } = body ?? {};

  const plan = plans.find((p) => p.id === planId && p.active);
  if (!plan) {
    return NextResponse.json(
      { error: "Plano inválido ou indisponível." },
      { status: 400 }
    );
  }

  const email = String(customerEmail ?? "").trim().toLowerCase();
  if (!customerName || !email) {
    return NextResponse.json(
      { error: "Nome e e-mail são obrigatórios." },
      { status: 400 }
    );
  }

  const origin = request.nextUrl.origin;
  // O PagBank exige URLs públicas (https) em redirect_url/notification_urls —
  // com o site local (http://127.0.0.1) essa validação falha. Em produção use
  // VORAZES_BASE_URL=https://seudominio; localmente, use um túnel público
  // (ex: ngrok) para testar o sandbox de ponta a ponta.
  const base = (process.env.VORAZES_BASE_URL ?? origin).trim().replace(/\/+$/, "");

  try {
    const order = await createOrder({
      planId: plan.id,
      planName: plan.name,
      priceInReais: plan.total,
      customerName,
      customerEmail: email,
      // Atenção: o PagBank (sandbox) rejeita URL com percent-encoding (%) em
      // redirect_url — passamos o email "cru" na query (válido para emails).
      redirectUrl: `${base}/confirmacao?plan=${plan.id}&email=${email}`,
      notificationUrl: `${base}/api/pagseguro/webhook`,
    });

    // Registra a assinatura como pendente (ou aprovada em modo mock) para a
    // consulta de acesso; o status final vem do webhook do PagBank.
    await upsertSubscription({
      email,
      planId: plan.id,
      checkoutId: order.orderId,
      status: order.status === "aprovado" ? "aprovado" : "pendente",
    });

    return NextResponse.json(order, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro desconhecido.";
    return NextResponse.json(
      { error: `Não foi possível iniciar o pagamento: ${message}` },
      { status: 500 }
    );
  }
}
