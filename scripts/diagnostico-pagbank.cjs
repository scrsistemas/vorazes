// Diagnóstico da credencial do PagBank (PagSeguro).
//
// Responde à pergunta que o erro "Invalid credential. Review AUTHORIZATION
// header." não responde: o token é inválido de verdade, ou só está sendo
// enviado para o ambiente errado (sandbox x produção)?
//
// O script testa o MESMO token contra as duas bases da API. Um POST /checkouts
// com corpo vazio não cria nada: se a autenticação passar, o PagBank recusa o
// corpo (400/422); se a credencial estiver errada, responde 401.
//
// Uso:
//   npm run diagnostico:pagbank
//   PAGSEGURO_TOKEN=xxxx npm run diagnostico:pagbank
//
// O token é lido de (nesta ordem): variável de ambiente, .env.local,
// .env.production, .env. Ele nunca é impresso — só o tamanho.
//
// Importante: no build standalone (hospedagem) o server.js NÃO lê
// .env.production; as variáveis precisam estar no painel do Node.js App.

const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");

// Mesma normalização de lib/pagseguro.ts: aspas acidentais e espaços nas
// pontas são a causa mais comum de 401 em variável copiada do painel.
function normalizar(raw) {
  const valor = (raw ?? "").trim();
  if (valor.length > 1) {
    const primeiro = valor[0];
    const ultimo = valor[valor.length - 1];
    if (
      (primeiro === '"' && ultimo === '"') ||
      (primeiro === "'" && ultimo === "'")
    ) {
      return valor.slice(1, -1).trim();
    }
  }
  return valor;
}

function lerEnv(nome) {
  const arquivo = path.join(raiz, nome);
  if (!fs.existsSync(arquivo)) return {};
  const vars = {};
  for (const linha of fs.readFileSync(arquivo, "utf8").split(/\r?\n/)) {
    const m = linha.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    vars[m[1]] = m[2];
  }
  return vars;
}

const arquivos = [".env.local", ".env.production", ".env"];
const origens = [{ nome: "variável de ambiente", vars: process.env }];
for (const nome of arquivos) origens.push({ nome, vars: lerEnv(nome) });

function buscar(chave) {
  for (const origem of origens) {
    if (origem.vars[chave] !== undefined && String(origem.vars[chave]).length > 0) {
      return { valor: String(origem.vars[chave]), origem: origem.nome };
    }
  }
  return { valor: "", origem: "(ausente)" };
}

const tokenBruto = buscar("PAGSEGURO_TOKEN");
const token = normalizar(tokenBruto.valor);
const envBruto = buscar("PAGSEGURO_ENV");
const env = normalizar(envBruto.valor).toLowerCase() || "sandbox";

const bases = [
  { nome: "sandbox", url: "https://sandbox.api.pagseguro.com" },
  { nome: "production", url: "https://api.pagseguro.com" },
];

async function testar(base) {
  try {
    const resposta = await fetch(`${base.url}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      // Corpo vazio de propósito: nunca cria checkout.
      body: "{}",
    });
    const texto = await resposta.text();
    return { status: resposta.status, corpo: texto.slice(0, 300) };
  } catch (erro) {
    return { status: 0, corpo: erro instanceof Error ? erro.message : String(erro) };
  }
}

function classificar(resultado) {
  if (resultado.status === 401) return "credencial rejeitada";
  if (resultado.status === 403) {
    // Apesar do nome, allowlist_access_required não é lista de IPs: é a
    // conta do vendedor que ainda não foi homologada para produção.
    if (/allowlist/i.test(resultado.corpo)) {
      return "conta NÃO homologada para produção (allowlist_access_required)";
    }
    return "sem permissão para este recurso";
  }
  if (resultado.status === 0) return `falha de rede: ${resultado.corpo}`;
  if (resultado.status >= 200 && resultado.status < 300) return "token aceito";
  if (resultado.status === 400 || resultado.status === 404 || resultado.status === 422) {
    return "token aceito (corpo vazio recusado, como esperado)";
  }
  if (resultado.status >= 500) return "erro no PagBank (instabilidade)";
  return `resposta inesperada (HTTP ${resultado.status})`;
}

async function main() {
  console.log("PagBank — diagnóstico de credencial\n");

  if (!token) {
    console.error(
      "PAGSEGURO_TOKEN não encontrado.\n\n" +
        "Defina a variável no ambiente ou crie um .env.local em " +
        `vorazes-site com:\n  PAGSEGURO_TOKEN=<token do painel PagBank>\n`
    );
    process.exit(1);
  }

  console.log(`Token: ${token.length} caracteres (origem: ${tokenBruto.origem})`);
  console.log(`PAGSEGURO_ENV configurado: "${env}" (origem: ${envBruto.origem})`);
  if (tokenBruto.valor !== token) {
    console.log("Aviso: aspas/espaços foram removidos do token (isso já derrubava a autenticação).");
  }
  console.log("");

  const resultados = [];
  for (const base of bases) {
    process.stdout.write(`Testando ${base.nome} (${base.url})... `);
    const resultado = await testar(base);
    const leitura = classificar(resultado);
    resultados.push({ ...base, ...resultado, leitura });
    console.log(`HTTP ${resultado.status} — ${leitura}`);
  }

  const aceitos = resultados.filter((r) =>
    /token aceito/.test(r.leitura)
  );

  console.log("");

  // Autenticou, mas a conta ainda não está liberada para vender em produção.
  const naoHomologado = resultados.find((r) =>
    /NÃO homologada/.test(r.leitura)
  );
  if (naoHomologado) {
    console.error(
      "O token está correto, mas a conta do PagBank ainda NÃO foi homologada\n" +
        "para usar a API de Checkout em produção (HTTP 403 allowlist_access_required).\n" +
        "Apesar do nome, isso não é lista de IPs do servidor — é a homologação\n" +
        "obrigatória do vendedor junto ao PagBank.\n\n" +
        "O que fazer:\n" +
        "  1. Abra a solicitação de homologação em\n" +
        "     https://app.pipefy.com/public/form/2e56YZLK\n" +
        "  2. Informe: e-mail/CNPJ da conta vendedora, a API usada (Checkout\n" +
        "     PagBank), o endpoint de produção e o domínio do site.\n" +
        "  3. Envie os logs de request/response do sandbox — o PagBank valida a\n" +
        "     integração antes de liberar a produção.\n" +
        "  4. O prazo informado é de até 4 dias úteis.\n\n" +
        "Enquanto isso, use o ambiente de sandbox (PAGSEGURO_ENV=sandbox) para\n" +
        "testar o fluxo completo."
    );
    process.exit(1);
  }

  if (aceitos.length === 0) {
    console.error(
      "Nenhum ambiente aceitou o token. Ele foi revogado, expirou ou não é um\n" +
        "token da API de Checkout do PagBank.\n\n" +
        "O que fazer:\n" +
        "  1. Gere um novo token no painel do PagBank, no ambiente desejado.\n" +
        "  2. Atenção: gerar um token novo invalida o anterior na hora.\n" +
        "  3. Cole o token no painel da hospedagem (Node.js App → variáveis de\n" +
        "     ambiente) e reinicie a aplicação.\n" +
        "  4. Tokens de sandbox e de produção são diferentes e não trocam entre si."
    );
    process.exit(1);
  }

  if (aceitos.length > 1) {
    console.warn(
      "O PagBank aceitou o token nos dois ambientes. Verifique no painel a qual\n" +
        "ambiente ele pertence antes de escolher PAGSEGURO_ENV."
    );
    process.exit(0);
  }

  const correto = aceitos[0].nome;
  console.log(`O token pertence ao ambiente: ${correto.toUpperCase()}`);
  if (env !== correto) {
    console.log(
      `\nCorreção: a aplicação está configurada como "${env}", que usa\n` +
        `${env === "production" ? "https://api.pagseguro.com" : "https://sandbox.api.pagseguro.com"}.\n` +
        `Defina PAGSEGURO_ENV=${correto} e reinicie a aplicação.`
    );
    process.exit(1);
  }

  console.log(
    "\nA configuração está correta. Se o checkout ainda falhar, verifique se a\n" +
      "aplicação em execução foi RECONSTRUÍDA após a troca do token: o build\n" +
      "standalone lê as variáveis apenas na inicialização do processo."
  );
}

main().catch((erro) => {
  console.error("Falha inesperada:", erro);
  process.exit(1);
});
