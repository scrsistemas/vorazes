// Arquivo de inicialização do site para hospedagem cPanel (Setup Node.js App).
//
// O painel "Setup Node.js App" do cPanel executa o Application startup file
// (este app.js) com Node.js e informa a porta pela variável de ambiente PORT.
// Este arquivo apenas carrega o server.js de produção gerado pelo build
// standalone do Next.js, que respeita a PORT e sobe o servidor pronto.
//
// Como este arquivo chega ao servidor:
//   1) npm run build                       (gera .next/standalone/server.js)
//   2) node scripts/empacotar-deploy.cjs   (monta deploy/vorazes-site com este arquivo dentro)
//   3) subir a pasta deploy/vorazes-site inteira por FTP
//   4) no cPanel: Application root = pasta enviada; startup file = app.js;
//      Application mode = Production; Node.js >= 20.9; definir as variáveis de
//      ambiente (ver .env.production.sample) e clicar em Restart.
//
// Não é preciso rodar npm install no servidor: o pacote standalone já contém
// o node_modules mínimo. Rodar este arquivo na raiz do projeto (fora do
// pacote de deploy) não funciona — o server.js só existe no pacote.
//
// DIAGNÓSTICO: todas as mensagens "[app.js]" saem no stderr, que é o que
// aparece no botão "Open log" do painel. Se o log estiver VAZIO, o arquivo
// nem foi executado (confira Application root e Application startup file).

"use strict";

const fs = require("node:fs");
const path = require("node:path");

function log(...partes) {
  // stderr é o canal capturado pelo Passenger/cPanel.
  console.error("[app.js]", ...partes);
}

log(
  `Iniciando. Node ${process.version} | PID ${process.pid} | dir ${__dirname}`
);

// Next.js 16 exige Node.js >= 20.9. Gerar o build com Node novo e rodar com
// Node antigo no servidor é uma das causas mais comuns de app que não sobe.
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  log(
    `ATENÇÃO: Node ${process.version} é antigo demais para o Next.js 16 (mínimo 20.9). ` +
      "Troque a versão em 'Setup Node.js App' e clique em Restart."
  );
}

// O Passenger informa a porta via PORT. Se ela não existir, o app sobe em
// 3000 e o proxy do painel fica esperando na porta dele -> Gateway Timeout.
const porta = Number.parseInt(process.env.PORT ?? "", 10);
if (Number.isFinite(porta) && porta > 0) {
  log(`Porta do painel (PORT): ${porta}`);
} else {
  log(
    "ATENÇÃO: variável PORT ausente ou inválida. O cPanel/Passenger deveria defini-la. " +
      "Sem ela o app escuta em 3000 e o proxy do painel não alcança o servidor " +
      "(sintoma típico: Gateway Timeout / 504). Confira 'Setup Node.js App' e reinicie."
  );
}

// Em hospedagem compartilhada Linux a variável HOSTNAME costuma vir definida
// pelo sistema com o hostname da máquina (ex.: br123.servidor.com.br). O
// server.js do Next.js usa esse valor como endereço de escuta, o que pode
// quebrar o listen (EADDRNOTAVAIL). O Passenger só exige escutar na porta
// informada via PORT; "0.0.0.0" (todas as interfaces) sempre funciona. Para
// usar outro endereço, defina BIND_HOST nas variáveis de ambiente do painel.
process.env.HOSTNAME = process.env.BIND_HOST || "0.0.0.0";

// Falhar rápido e com mensagem clara: melhor um 503 com causa no log do que
// um processo pendurado gerando 504 sem pista nenhuma.
process.on("uncaughtException", (erro) => {
  log("Erro não tratado durante a execução:", erro && erro.stack ? erro.stack : erro);
  process.exit(1);
});
process.on("unhandledRejection", (motivo) => {
  log("Promise rejeitada sem tratamento:", motivo);
  process.exit(1);
});

const serverJs = path.join(__dirname, "server.js");
if (!fs.existsSync(serverJs)) {
  log(
    "server.js não encontrado ao lado deste arquivo. Rode `npm run build` e " +
      "`node scripts/empacotar-deploy.cjs`, e envie a pasta deploy/vorazes-site " +
      "inteira por FTP. No cPanel, o Application root deve apontar para ela."
  );
  process.exit(1);
}

// Upload por FTP interrompido deixa o pacote incompleto; o build standalone
// sempre gera .next/BUILD_ID.
if (!fs.existsSync(path.join(__dirname, ".next", "BUILD_ID"))) {
  log(
    ".next/BUILD_ID ausente: o envio por FTP parece incompleto. " +
      "Reenvie a pasta deploy/vorazes-site inteira (incluindo a subpasta .next oculta)."
  );
  process.exit(1);
}

// require() resolve relativo a este arquivo (e não ao diretório atual do
// processo), então funciona mesmo que o Passenger inicie a app de outro lugar.
log("Carregando server.js do Next.js...");
require("./server.js");
