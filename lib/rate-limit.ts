import { NextRequest } from "next/server";

// Rate limiting simples em memória (janela fixa por chave). Suficiente para
// uma instância; em deploy multi-instância/edge, trocar por um cache
// distribuído (ex.: Upstash/Redis). O objetivo é conter abuso básico:
// criação de checkouts em massa, enumeração de e-mails, spam no webhook.

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function prune() {
  // Evita crescimento infinito do mapa: limpa buckets expirados quando o
  // mapa fica grande (trabalho ocasional, amortizado).
  if (buckets.size < 10_000) return;
  const now = Date.now();
  for (const [key, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  prune();

  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
}

// Identifica o cliente, priorizando o header de proxy (X-Forwarded-For).
// "unknown" agrupa chamadas sem IP (ex.: testes locais) — limite conservador.
export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}