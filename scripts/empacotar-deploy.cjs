// Empacota o build standalone em deploy/vorazes-site — pronto para subir por
// FTP para uma hospedagem cPanel/Plesk (Node.js App).
//
// Uso:   node scripts/empacotar-deploy.cjs   (após `npm run build`)
//
// O que ele faz:
//   1. Copia .next/standalone/* (server.js + node_modules mínimos) para a pasta de deploy
//   2. Copia .next/static (assets estáticos do build) para deploy/.next/static
//   3. Copia public/* (logo, favicon, ZIP de atualização, etc.)
//   4. Copia app.js (arquivo de inicialização exigido pelo cPanel: carrega o server.js)
//   5. Garante a pasta vazia deploy/data/installers (onde ficarão os instaladores)
//
// ATENÇÃO: o server.js gerado pelo standalone NÃO carrega .env.production
// (não há loadEnvConfig). As variáveis abaixo precisam ser definidas no
// painel da hospedagem, em "Node.js App" → variáveis de ambiente:
//   PAGSEGURO_ENV=production
//   PAGSEGURO_TOKEN=<token real do MESMO ambiente: produção não usa token de sandbox>
//   VORAZES_BASE_URL=https://seudominio
//   VORAZES_APP_VERSION=1.0.0
//   VORAZES_UPDATE_FILE=vorazes-1.0.0.zip
// Este arquivo serve só de referência. NUNCA envie o token no ZIP compartilhado.

const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const deploy = path.join(raiz, "deploy", "vorazes-site");

function copiarTudo(origem, destino) {
  if (!fs.existsSync(origem)) return;
  fs.mkdirSync(destino, { recursive: true });
  for (const item of fs.readdirSync(origem)) {
    const origemItem = path.join(origem, item);
    const destinoItem = path.join(destino, item);
    const stat = fs.statSync(origemItem);
    if (stat.isDirectory()) copiarTudo(origemItem, destinoItem);
    else fs.copyFileSync(origemItem, destinoItem);
  }
}

if (fs.existsSync(deploy)) fs.rmSync(deploy, { recursive: true });
fs.mkdirSync(deploy, { recursive: true });

const standalone = path.join(raiz, ".next", "standalone");
if (!fs.existsSync(path.join(standalone, "server.js"))) {
  console.error("Pasta .next/standalone não encontrada. Rode `npm run build` primeiro.");
  process.exit(1);
}

copiarTudo(standalone, deploy);
copiarTudo(path.join(raiz, ".next", "static"), path.join(deploy, ".next", "static"));
copiarTudo(path.join(raiz, "public"), path.join(deploy, "public"));
// app.js: startup file do cPanel (Setup Node.js App). O Passenger o executa
// e ele apenas carrega o server.js standalone que está na mesma pasta.
const appJs = path.join(raiz, "app.js");
if (!fs.existsSync(appJs)) {
  console.error("app.js não encontrado na raiz do projeto (arquivo de inicialização do cPanel).");
  process.exit(1);
}
fs.copyFileSync(appJs, path.join(deploy, "app.js"));
// Pasta de instaladores (fica vazia no pacote; os arquivos vão depois por FTP)
fs.mkdirSync(path.join(deploy, "data", "installers"), { recursive: true });

// Cria .env.production sem token, apenas com o modelo, para o usuário preencher
const exemploEnv = [
  "# PREENCHA e salve como .env.production neste diretório",
  "PAGSEGURO_ENV=production",
  "PAGSEGURO_TOKEN=",
  "VORAZES_BASE_URL=https://app.scrsistemas.com.br",
  "VORAZES_APP_VERSION=1.0.0",
  "VORAZES_UPDATE_FILE=vorazes-1.0.0.zip",
].join("\n") + "\n";
fs.writeFileSync(path.join(deploy, ".env.production.sample"), exemploEnv);

const bytes = fs.readdirSync(deploy, { recursive: true })
  .reduce((acc, f) => acc + (fs.statSync(path.join(deploy, f)).size || 0), 0);

console.log("Pacote de deploy criado em:", deploy);
console.log("Tamanho aproximado: " + (bytes / 1024 / 1024).toFixed(1) + " MB");
console.log("");
console.log("PRÓXIMOS PASSOS:");
console.log(" 1) No painel da hospedagem (Node.js App → variáveis de ambiente) defina PAGSEGURO_ENV, PAGSEGURO_TOKEN, VORAZES_BASE_URL, VORAZES_APP_VERSION e VORAZES_UPDATE_FILE (ver .env.production.sample)");
console.log(" 2) Na hospedagem: configure um subdomínio app.scrsistemas.com.br apontando para o Node.js App");
console.log(" 3) Suba a pasta deploy/vorazes-site inteira por FTP para a raiz do Node.js App");
console.log(" 4) No cPanel (Setup Node.js App): Application startup file = app.js (a porta o painel define via variável PORT; o app.js carrega o server.js)");
console.log(" 5) Coloque os instaladores em deploy/vorazes-site/data/installers/ com os nomes de config/downloads.ts");
console.log(" 6) Coloque o ZIP de atualização em deploy/vorazes-site/public/ (ex.: vorazes-1.0.0.zip)");