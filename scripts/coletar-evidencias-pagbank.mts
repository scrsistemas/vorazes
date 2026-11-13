// Gera um pacote de evidências das requisições enviadas ao PagBank, pronto
// para anexar no formulário de homologação (Checkout PagBank).
//
// Uso:
//   npm run evidencias:pagbank                -> envia de verdade no SANDBOX
//   npm run evidencias:pagbank -- --sem-enviar -> só monta o arquivo, sem rede
//   npm run evidencias:pagbank -- --producao   -> envia em PRODUÇÃO (cuidado)
//
// O que ele faz:
//   1. Lê PAGSEGURO_TOKEN/PAGSEGURO_ENV de .env.local, .env.production, .env
//      ou do próprio ambiente (nessa ordem de prioridade).
//   2. Usa a MESMA função de payload da aplicação (buildCheckoutBody) e o
//      mesmo createOrder, capturando request e response reais via fetch.
//   3. Grava tudo em evidencias-pagbank/<data>-<ambiente>/:
//        requests.md                      <- arquivo legível com tudo
//        01-criar-checkout.request.json
//        01-criar-checkout.response.json
//        02-consultar-checkout.*.json
//        00-resumo.md                     <- resultado e próximos passos
//
// O token NUNCA é gravado: o header Authorization é omitido nos arquivos.
//
// Requer Node 22.6+ (com --experimental-strip-types) ou Node 23.6+ (padrão).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const semEnviar = args.includes("--sem-enviar");
const producao = args.includes("--producao");

/** Remove aspas acidentais e espaços nas pontas (mesma regra do site). */
function normalizar(valor: unknown): string {
  const texto = String(valor ?? "").trim();
  if (texto.length > 1) {
    const primeiro = texto[0];
    const ultimo = texto[texto.length - 1];
    if (
      (primeiro === '"' && ultimo === '"') ||
      (primeiro === "'" && ultimo === "'")
    ) {
      return texto.slice(1, -1).trim();
    }
  }
  return texto;
}

// Carrega .env sem sobrescrever o que já veio do ambiente.
for (const nome of [".env.local", ".env.production", ".env"]) {
  const arquivo = path.join(RAIZ, nome);
  if (!existsSync(arquivo)) continue;
  for (const linha of readFileSync(arquivo, "utf8").split(/\r?\n/)) {
    const m = linha.match(
      /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/
    );
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = normalizar(m[2]);
  }
}

const envConfigurado =
  normalizar(process.env.PAGSEGURO_ENV).toLowerCase() || "sandbox";

// Envio real: sandbox por padrão; produção só com --producao explícito.
// Modo offline: respeita o ambiente já configurado, para o documento sair
// igual ao que a aplicação realmente usa.
const alvo: "sandbox" | "production" = producao
  ? "production"
  : semEnviar
    ? envConfigurado === "production"
      ? "production"
      : "sandbox"
    : "sandbox";

process.env.PAGSEGURO_ENV = alvo;

if (!semEnviar && envConfigurado !== alvo) {
  console.warn(
    `Aviso: PAGSEGURO_ENV configurado é "${envConfigurado}", mas esta execução ` +
      `usará "${alvo}". O token precisa ser do ambiente "${alvo}".`
  );
}
if (producao) {
  console.warn(
    "Aviso: --producao cria um checkout REAL (não pago) na conta de produção. " +
      "Só faz sentido com a conta já homologada."
  );
}

const token = normalizar(process.env.PAGSEGURO_TOKEN);
const BASE =
  alvo === "production"
    ? "https://api.pagseguro.com"
    : "https://sandbox.api.pagseguro.com";

const planId = "vorazes";
const planName = "Vorazes";
const priceInReais = 1800; // mesmo total de config/plans.ts

const site = (
  normalizar(process.env.VORAZES_BASE_URL) || "https://exemplo.com"
).replace(/\/+$/, "");
const email =
  normalizar(process.env.EVIDENCIA_EMAIL) || "homologacao@exemplo.com";
const nome =
  normalizar(process.env.EVIDENCIA_NOME) || "Cliente Teste Homologacao";

const input = {
  planId,
  planName,
  priceInReais,
  customerName: nome,
  customerEmail: email,
  redirectUrl: `${site}/confirmacao?plan=${planId}&email=${email}`,
  notificationUrl: `${site}/api/pagseguro/webhook`,
};

type Captura = {
  metodo: string;
  url: string;
  headers: Record<string, string>;
  corpo: unknown;
  status?: number;
  headersResposta?: Record<string, string>;
  corpoResposta?: string;
  duracaoMs?: number;
  erro?: string;
};

const capturas: Captura[] = [];

/** Oculta credenciais antes de gravar em disco. */
function redigir(headers: Record<string, string>): Record<string, string> {
  const copia: Record<string, string> = {};
  for (const [chave, valor] of Object.entries(headers)) {
    copia[chave] = /authorization|api[-_]?key/i.test(chave)
      ? "Bearer <omitido>"
      : valor;
  }
  return copia;
}

function json(valor: unknown): string {
  return JSON.stringify(valor, null, 2) ?? "null";
}

function bloco(valor: unknown): string {
  return ["```json", json(valor), "```"].join("\n");
}

const { buildCheckoutBody, createOrder, fetchCheckoutStatus } = await import(
  "../lib/pagseguro.ts"
);

const agora = new Date();
const stamp = agora.toISOString().replace(/[:]/g, "-").replace(/\..+$/, "");
const pasta = path.join(
  RAIZ,
  "evidencias-pagbank",
  `${stamp}-${semEnviar ? "exemplo" : alvo}`
);
mkdirSync(pasta, { recursive: true });

let orderId: string | null = null;
let checkoutUrl: string | null = null;
let erroGeral: string | null = null;

if (semEnviar) {
  // Sem rede: monta exatamente o request que a aplicação enviaria.
  capturas.push({
    metodo: "POST",
    url: `${BASE}/checkouts`,
    headers: {
      Authorization: token ? `Bearer ${token}` : "Bearer <PAGSEGURO_TOKEN>",
      "Content-Type": "application/json",
      accept: "application/json",
    },
    corpo: buildCheckoutBody(input),
  });
} else {
  if (!token) {
    console.error(
      "PAGSEGURO_TOKEN não encontrado.\n\n" +
        "Defina a variável no ambiente ou crie um .env.local em vorazes-site.\n" +
        "Para apenas visualizar as requests, rode com --sem-enviar."
    );
    process.exit(1);
  }

  // Intercepta o fetch para registrar request e response reais.
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = (async (entrada: any, init: any = {}) => {
    const inicio = Date.now();
    const url =
      typeof entrada === "string" ? entrada : String(entrada?.url ?? "");
    const metodo = String(
      init?.method ?? (typeof entrada === "object" ? entrada?.method : "GET")
    ).toUpperCase();
    const headers = Object.fromEntries(
      new Headers(
        init?.headers ??
          (typeof entrada === "object" ? entrada?.headers : undefined)
      ).entries()
    );

    let corpo: unknown = init?.body;
    if (typeof corpo === "string") {
      try {
        corpo = JSON.parse(corpo);
      } catch {
        // mantém o texto original
      }
    }

    const captura: Captura = { metodo, url, headers, corpo };
    capturas.push(captura);

    try {
      const resposta = await fetchOriginal(entrada, init);
      const clone = resposta.clone();
      captura.status = resposta.status;
      const headersResp = Object.fromEntries(resposta.headers.entries());
      delete headersResp["set-cookie"];
      captura.headersResposta = headersResp;
      let corpo = await clone.text();
      if (/Attention Required|Sorry, you have been blocked/i.test(corpo)) {
        const match = corpo.match(/<title>([^<]+)<\/title>/i);
        if (match)
          corpo = JSON.stringify({
            cloudflare: match[1],
            hint: "Provável bloqueio WAF/rede (Cloudflare). Verifique IP ou rede.",
          });
      }
      captura.corpoResposta = corpo;
      captura.duracaoMs = Date.now() - inicio;
      return resposta;
    } catch (erro) {
      captura.erro = erro instanceof Error ? erro.message : String(erro);
      captura.duracaoMs = Date.now() - inicio;
      throw erro;
    }
  }) as typeof fetch;

  try {
    const pedido = await createOrder(input);
    orderId = pedido.orderId;
    checkoutUrl = pedido.checkoutUrl;

    // Segunda requisição: consulta do checkout (a mesma que o webhook usa).
    await fetchCheckoutStatus(pedido.orderId);
  } catch (erro) {
    erroGeral = erro instanceof Error ? erro.message : String(erro);
  }
}

// ---------------------------------------------------------------- arquivos

function nomeArquivo(indice: number, captura: Captura): string {
  const acao =
    captura.metodo === "POST"
      ? "criar-checkout"
      : captura.metodo === "GET"
        ? "consultar-checkout"
        : "requisicao";
  return `${String(indice + 1).padStart(2, "0")}-${acao}`;
}

for (const [indice, captura] of capturas.entries()) {
  const nome = nomeArquivo(indice, captura);
  const request = {
    metodo: captura.metodo,
    url: captura.url,
    headers: redigir(captura.headers),
    body: captura.corpo ?? null,
  };
  writeFileSync(
    path.join(pasta, `${nome}.request.json`),
    json(request) + "\n",
    "utf8"
  );

  if (captura.status !== undefined || captura.erro) {
    const response = {
      status: captura.status ?? 0,
      erro: captura.erro,
      duracaoMs: captura.duracaoMs ?? null,
      headers: captura.headersResposta ?? null,
      body: captura.corpoResposta
        ? (() => {
            try {
              return JSON.parse(captura.corpoResposta);
            } catch {
              return captura.corpoResposta;
            }
          })()
        : null,
    };
    writeFileSync(
      path.join(pasta, `${nome}.response.json`),
      json(response) + "\n",
      "utf8"
    );
  }
}

const linhas: string[] = [
  "# Requests enviados ao PagBank",
  "",
  `- Gerado em: ${agora.toISOString()}`,
  `- Ambiente: **${semEnviar ? `${alvo} (sem envio)` : alvo}**`,
  `- Base: \`${BASE}\``,
  `- Token: ${token ? `${token.length} caracteres (valor omitido de propósito)` : "ausente"}`,
  `- Endpoint principal: \`POST ${BASE}/checkouts\``,
  "",
  "> O header `Authorization` foi substituído por `<omitido>` para que este",
  "> arquivo possa ser anexado em chamados sem expor a credencial.",
  "",
];

for (const [indice, captura] of capturas.entries()) {
  linhas.push(`## ${indice + 1}. ${captura.metodo} ${captura.url}`, "");
  if (captura.status !== undefined) {
    linhas.push(
      `**Resposta:** HTTP ${captura.status} em ${captura.duracaoMs ?? "?"} ms`,
      ""
    );
  } else if (captura.erro) {
    linhas.push(`**Erro de rede:** ${captura.erro}`, "");
  }
  linhas.push("### Request headers", "", bloco(redigir(captura.headers)), "");
  linhas.push("### Request body", "", bloco(captura.corpo ?? null), "");
  if (captura.corpoResposta) {
    let corpo: unknown = captura.corpoResposta;
    try {
      corpo = JSON.parse(captura.corpoResposta);
    } catch {
      // mantém texto
    }
    linhas.push("### Response body", "", bloco(corpo), "");
  }
  linhas.push("---", "");
}

// Explicação e próximos passos conforme o resultado.
const ultimo = capturas[capturas.length - 1];
const statusFinal = ultimo?.status ?? 0;
const corpoFinal: any = (() => {
  try {
    return JSON.parse(ultimo?.corpoResposta ?? "null");
  } catch {
    return null;
  }
})();
const mensagemApi =
  corpoFinal?.error_messages?.[0]?.description ??
  corpoFinal?.error_messages?.[0]?.error ??
  erroGeral ??
  "";

const resumo: string[] = [
  "# Evidências de integração — resumo",
  "",
  `- Data: ${agora.toISOString()}`,
  `- Ambiente: ${alvo}`,
  `- Base: ${BASE}`,
  `- Plano: ${planName} (${planId}) — ${priceInReais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}`,
  `- Domínio informado (VORAZES_BASE_URL): ${site}`,
  "",
];

if (semEnviar) {
  resumo.push(
    "## Modo sem envio",
    "",
    "Nenhuma requisição foi feita. Este pacote mostra apenas o request que a",
    "aplicação monta. Para gerar evidência real, rode:",
    "",
    "```bash",
    "npm run evidencias:pagbank",
    "```",
    ""
  );
} else if (!erroGeral) {
  resumo.push(
    "## Resultado",
    "",
    `- Criar checkout: HTTP ${statusFinal} (sucesso)`,
    `- ID do checkout: ${orderId ?? "(não retornado)"}`,
    `- Link de pagamento: ${checkoutUrl ?? "(não retornado)"}`,
    `- Consultar checkout: HTTP ${ultimo?.status ?? "?"} — status interno consultado`,
    ""
  );
} else {
  resumo.push(
    "## Resultado",
    "",
    `- Criar checkout: HTTP ${statusFinal}`,
    `- Mensagem: ${mensagemApi || erroGeral}`,
    ""
  );

  if (/invalid credential/i.test(mensagemApi)) {
    resumo.push(
      "## Causa",
      "",
      "Credencial rejeitada: token de sandbox x produção, token revogado ou",
      "valor com aspas/espaços. Rode o diagnóstico: `npm run diagnostico:pagbank`.",
      ""
    );
  } else if (/allowlist/i.test(mensagemApi)) {
    resumo.push(
      "## Causa",
      "",
      "`allowlist_access_required` = **conta vendedora não homologada** para a API",
      "de Checkout em produção (não é lista de IPs). Solicite a homologação em",
      "https://app.pipefy.com/public/form/2e56YZLK anexando este pacote.",
      ""
    );
  }
}

resumo.push(
  "## Arquivos",
  "",
  "- `requests.md` — todas as requisições e respostas em formato legível",
  "- `*.request.json` / `*.response.json` — os mesmos dados em JSON",
  "",
  "## Para completar a evidência de homologação",
  "",
  "1. Se o checkout foi criado, abra o link de pagamento e pague com um cartão",
  "   de teste (sandbox): VISA `4539620659922097`, CVV `123`, validade `12/2026`.",
  "   Lista oficial: https://developer.pagbank.com.br/docs/cartoes-de-teste",
  "2. Salve o payload do webhook que sua rota `/api/pagseguro/webhook` recebeu.",
  "3. Anexe esta pasta no formulário https://app.pipefy.com/public/form/2e56YZLK",
  "   junto com e-mail/CNPJ da conta e o domínio do site.",
  ""
);

writeFileSync(path.join(pasta, "requests.md"), linhas.join("\n"), "utf8");
writeFileSync(path.join(pasta, "00-resumo.md"), resumo.join("\n"), "utf8");

console.log("");
console.log("Evidências geradas em:");
console.log(`  ${pasta}`);
console.log("");
console.log("Arquivo principal:");
console.log(`  ${path.join(pasta, "requests.md")}`);
console.log("");

if (semEnviar) {
  console.log("Modo sem envio: nenhuma requisição foi feita.");
  console.log("Para evidência real, rode: npm run evidencias:pagbank");
} else if (erroGeral) {
  console.log(`Resultado: ${erroGeral}`);
  console.log(`HTTP ${statusFinal}: ${mensagemApi}`);
  process.exitCode = 1;
} else {
  console.log(`Checkout criado: ${orderId}`);
  console.log(`Link de pagamento: ${checkoutUrl ?? "(não retornado)"}`);
}
