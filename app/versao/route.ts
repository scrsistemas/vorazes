import { NextResponse } from "next/server";

// Endpoint consultado pelo aplicativo Vorazes para detectar e baixar
// atualizações (auto-update).
//
// Contrato esperado pelo App (ServicoAtualizacoes.cs):
//   GET {VORAZES_BASE_URL}/versao
//   -> { "versao": "v1.0.1", "arquivo": "vorazes-1.0.1.zip" | URL absoluta,
//        "notas": "..." }
//   GET {VORAZES_BASE_URL}/{arquivo}  -> ZIP do build novo.
//
// O ZIP deve ser colocado na pasta pública "public" da raiz do projeto (ou o
// caminho pode ser uma URL absoluta via VORAZES_UPDATE_FILE). A versão e as
// notas são sobrescritas por variáveis de ambiente em cada release.
export async function GET() {
  const base = (process.env.VORAZES_BASE_URL ?? "").trim().replace(/\/+$/, "");

  const versaoFull = `v${(process.env.VORAZES_APP_VERSION ?? "1.0.0").trim().replace(/^v/i, "")}`;
  const arquivo = (process.env.VORAZES_UPDATE_FILE ?? "vorazes-1.0.0.zip").trim();
  const notas = (process.env.VORAZES_UPDATE_NOTAS ?? "").trim();

  const urlArquivo = arquivo.startsWith("http://") || arquivo.startsWith("https://")
    ? arquivo
    : `${base}/${arquivo}`;

  return NextResponse.json(
    {
      versao: versaoFull,
      arquivo: urlArquivo,
      notas,
    },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}