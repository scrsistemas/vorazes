import { NextRequest, NextResponse } from "next/server";
import { fetchCheckoutStatus } from "@/lib/pagseguro";
import {
  getSubscriptionByCheckoutId,
  upsertSubscription,
} from "@/lib/subscriptions";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Endpoint que recebe as notificações do PagBank quando o status de um
// checkout/assinatura muda (primeira cobrança paga, cobranças recorrentes
// seguintes, cancelamento, etc.).
//
// Eventos relevantes de assinatura que o PagBank pode notificar:
// subscription.initial, .recurrence, .activated, .suspended, .expired,
// .canceled — ver https://developer.pagbank.com.br/reference/webhooks-assinaturas
//
// Por segurança, em vez de confiar apenas no conteúdo da notificação,
// sempre reconsultamos o checkout diretamente na API (GET /checkouts/{id})
// e usamos o status retornado por lá como fonte da verdade. Esse status é
// persistido e consultado por /api/assinatura/status para liberar (ou
// bloquear) o acesso/download do sistema conforme o cliente realmente pagou.
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`webhook:${ip}`, 60, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  let payload: { id?: string; checkout_id?: string; event?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  // Aceita apenas payloads com um identificador de checkout textual. Isso
  // reduz superfície de entrada sem depender de assinatura HMAC; o estado
  // final nunca vem do payload, e sim da reconsulta na API do PagBank.
  const checkoutId = payload?.checkout_id ?? payload?.id;
  if (typeof checkoutId !== "string" || checkoutId.length === 0) {
    return NextResponse.json(
      { error: "Notificação sem identificador de checkout." },
      { status: 400 }
    );
  }

  const status = await fetchCheckoutStatus(checkoutId);

  const subscription = await getSubscriptionByCheckoutId(checkoutId);
  if (subscription) {
    await upsertSubscription({
      email: subscription.email,
      planId: subscription.planId,
      checkoutId,
      status,
    });
  }

  return NextResponse.json({
    received: true,
    checkoutId,
    event: payload.event,
    status,
  });
}