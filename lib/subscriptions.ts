import fs from "fs";
import path from "path";

// Registro de assinaturas/pagamentos.
//
// O webhook do PagBank grava aqui o status real de cada checkout, e as
// páginas de confirmação/download consultam este arquivo para decidir se o
// cliente realmente pagou antes de liberar o acesso (evita baixar sem pagar).
//
// IMPORTANTE: armazenamento simples em arquivo JSON — adequado para um site
// pequeno. Antes de colocar em produção em várias instâncias, troque por um
// banco de dados (o fluxo é isolado nesta camada; `lib/subscriptions.ts`).

export type SubscriptionStatus =
  | "aprovado"
  | "pendente"
  | "recusado"
  | "cancelado"
  | "suspenso";

export type Subscription = {
  email: string;
  planId: string;
  checkoutId: string;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
};

const STORE_DIR = process.env.STORE_DIR ?? path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "subscriptions.json");

function readAll(): Subscription[] {
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: Subscription[]) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getSubscription(email: string): Subscription | null {
  const key = normalizeEmail(email);
  return readAll().find((s) => s.email === key) ?? null;
}

export function getSubscriptionByCheckoutId(
  checkoutId: string
): Subscription | null {
  return readAll().find((s) => s.checkoutId === checkoutId) ?? null;
}

export function upsertSubscription(input: {
  email: string;
  planId: string;
  checkoutId: string;
  status: SubscriptionStatus;
}) {
  const list = readAll();
  const key = normalizeEmail(input.email);
  const now = new Date().toISOString();
  const idx = list.findIndex((s) => s.email === key);

  const next: Subscription = {
    email: key,
    planId: input.planId,
    checkoutId: input.checkoutId,
    status: input.status,
    createdAt: idx >= 0 ? list[idx].createdAt : now,
    updatedAt: now,
  };

  if (idx >= 0) list[idx] = next;
  else list.push(next);
  writeAll(list);
}