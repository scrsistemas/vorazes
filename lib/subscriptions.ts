import fs from "node:fs";
import path from "node:path";

// Registro de assinaturas/pagamentos.
//
// O webhook do PagBank grava aqui o status real de cada checkout, e as
// páginas de confirmação/download consultam este registro para decidir se o
// cliente realmente pagou antes de liberar o acesso (evita baixar sem pagar).
//
// Dois backends, escolhidos automaticamente:
//
// 1. Redis REST (Vercel KV / Upstash) — quando KV_REST_API_URL +
//    KV_REST_API_TOKEN (ou UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
//    estão definidos. Obrigatório na Vercel, cujo filesystem é somente
//    leitura (gravar em data/ lá falha com EROFS: /var/task/...).
// 2. Arquivo JSON local (data/subscriptions.json) — dev local e cPanel.
//
// Sem dependência extra: o Redis REST é acessado por fetch (POST com o
// comando em JSON). Chaves usadas:
//   vorazes:assinatura:<email>       -> JSON da assinatura
//   vorazes:checkout:<checkoutId>    -> e-mail dono do checkout

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

// ---------------------------------------------------------------------------
// Backend remoto (Vercel KV / Upstash Redis REST)
// ---------------------------------------------------------------------------

const KV_URL =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
const usaRemoto = Boolean(KV_URL && KV_TOKEN);

const PREFIXO_ASSINATURA = "vorazes:assinatura:";
const PREFIXO_CHECKOUT = "vorazes:checkout:";

async function kv(comando: (string | number)[]): Promise<unknown> {
  const resposta = await fetch(KV_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(comando),
    // Sempre buscar o estado mais recente (nada de cache de fetch).
    cache: "no-store",
  });

  if (!resposta.ok) {
    throw new Error(
      `Falha ao acessar o armazenamento (${resposta.status}): ${await resposta.text()}`
    );
  }

  const dados = (await resposta.json()) as {
    result?: unknown;
    error?: string;
  };
  if (dados.error) {
    throw new Error(`Erro do armazenamento: ${dados.error}`);
  }
  return dados.result ?? null;
}

function parseAssinatura(bruto: unknown): Subscription | null {
  if (bruto === null || bruto === undefined) return null;
  try {
    return JSON.parse(String(bruto)) as Subscription;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Backend local (arquivo JSON) — dev e cPanel
// ---------------------------------------------------------------------------

let avisoVercelEmitido = false;

function avisarVercelSemKv() {
  if (avisoVercelEmitido) return;
  avisoVercelEmitido = true;
  console.error(
    "[subscriptions] Vercel detectada sem armazenamento configurado. " +
      "O filesystem é somente leitura; defina KV_REST_API_URL e KV_REST_API_TOKEN " +
      "(Vercel KV/Upstash) nas variáveis de ambiente do projeto."
  );
}

function lerArquivo(): Subscription[] {
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function gravarArquivo(list: Subscription[]) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

function erroArmazenamentoAusente(): Error {
  return new Error(
    "Armazenamento de assinaturas não configurado na Vercel (filesystem somente leitura). " +
      "Conecte um Redis (Vercel KV/Upstash) ao projeto e configure KV_REST_API_URL e " +
      "KV_REST_API_TOKEN nas variáveis de ambiente, depois faça redeploy."
  );
}

function normalizarEmail(email: string) {
  return email.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// API pública (assíncrona: o backend remoto usa rede)
// ---------------------------------------------------------------------------

export async function getSubscription(
  email: string
): Promise<Subscription | null> {
  const chave = normalizarEmail(email);

  if (usaRemoto) {
    try {
      return parseAssinatura(
        await kv(["GET", PREFIXO_ASSINATURA + chave])
      );
    } catch (erro) {
      // Se o Redis estiver indisponível na Vercel, usa a lista local
      // empacotada como fallback (somente leitura) para não travar o acesso.
      console.error("[subscriptions] falha no Redis ao ler assinatura:", erro);
      return lerArquivo().find((s) => s.email === chave) ?? null;
    }
  }

  if (process.env.VERCEL) {
    avisarVercelSemKv();
    return lerArquivo().find((s) => s.email === chave) ?? null;
  }

  return lerArquivo().find((s) => s.email === chave) ?? null;
}

export async function getSubscriptionByCheckoutId(
  checkoutId: string
): Promise<Subscription | null> {
  if (usaRemoto) {
    try {
      const email = await kv(["GET", PREFIXO_CHECKOUT + checkoutId]);
      return email ? getSubscription(String(email)) : null;
    } catch (erro) {
      console.error("[subscriptions] falha no Redis ao ler checkout:", erro);
      return lerArquivo().find((s) => s.checkoutId === checkoutId) ?? null;
    }
  }

  if (process.env.VERCEL) {
    avisarVercelSemKv();
    return lerArquivo().find((s) => s.checkoutId === checkoutId) ?? null;
  }

  return lerArquivo().find((s) => s.checkoutId === checkoutId) ?? null;
}

export async function upsertSubscription(input: {
  email: string;
  planId: string;
  checkoutId: string;
  status: SubscriptionStatus;
}): Promise<void> {
  const chave = normalizarEmail(input.email);
  const agora = new Date().toISOString();

  if (usaRemoto) {
    const anterior = parseAssinatura(
      await kv(["GET", PREFIXO_ASSINATURA + chave])
    );

    const proxima: Subscription = {
      email: chave,
      planId: input.planId,
      checkoutId: input.checkoutId,
      status: input.status,
      createdAt: anterior?.createdAt ?? agora,
      updatedAt: agora,
    };

    await kv([
      "SET",
      PREFIXO_ASSINATURA + chave,
      JSON.stringify(proxima),
    ]);
    await kv(["SET", PREFIXO_CHECKOUT + input.checkoutId, chave]);
    // Remove o mapeamento do checkout antigo para não reativar status por um
    // webhook atrasado de uma tentativa anterior.
    if (anterior && anterior.checkoutId !== input.checkoutId) {
      await kv(["DEL", PREFIXO_CHECKOUT + anterior.checkoutId]);
    }
    return;
  }

  if (process.env.VERCEL) {
    avisarVercelSemKv();
    throw erroArmazenamentoAusente();
  }

  const list = lerArquivo();
  const idx = list.findIndex((s) => s.email === chave);

  const next: Subscription = {
    email: chave,
    planId: input.planId,
    checkoutId: input.checkoutId,
    status: input.status,
    createdAt: idx >= 0 ? list[idx].createdAt : agora,
    updatedAt: agora,
  };

  if (idx >= 0) list[idx] = next;
  else list.push(next);
  gravarArquivo(list);
}
