import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { NextRequest } from "next/server";
import { getSubscription } from "@/lib/subscriptions";
import { downloads } from "@/config/downloads";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Entrega o instalador SOMENTE para quem tem assinatura ativa (pagamento
// aprovado via webhook). O arquivo fica fora do perímetro público (diretório
// privado, padrão `data/installers`) e nunca é servido como estático — por
// isso copiar a URL não basta: sem estar aprovado, o request retorna 403.
export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`download:${ip}`, 10, 60_000);
  if (!limited.allowed) {
    return new Response(JSON.stringify({ error: "Muitas solicitações." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(limited.retryAfterSeconds),
      },
    });
  }

  const search = request.nextUrl.searchParams;
  const email = (search.get("email") ?? "").trim().toLowerCase();
  const fileId = (search.get("file") ?? "").trim();

  if (!email || !fileId) {
    return new Response(JSON.stringify({ error: "Parâmetros incompletos." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validar pagamento antes de qualquer acesso ao arquivo.
  const subscription = await getSubscription(email);
  if (!subscription || subscription.status !== "aprovado") {
    return new Response(
      JSON.stringify({
        error: "Acesso liberado apenas após a confirmação do pagamento.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const download = downloads.find((d) => d.id === fileId);
  if (!download) {
    return new Response(JSON.stringify({ error: "Arquivo não encontrado." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!download.fileName) {
    return new Response(
      JSON.stringify({ error: "Instalador ainda não publicado." }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // Nunca confiar no nome vindo de config para navegar: força-o a um
  // basename (bloqueia "../", caminhos absolutos, etc.). Diretório com
  // escopo estático (fora de public/) para o instalador não ser público.
  const fileName = path.basename(download.fileName);
  const filePath = path.join(process.cwd(), "data", "installers", fileName);

  if (!fs.existsSync(filePath)) {
    return new Response(JSON.stringify({ error: "Arquivo não encontrado." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stat = fs.statSync(filePath);
  const stream = Readable.toWeb(
    fs.createReadStream(filePath)
  ) as ReadableStream<Uint8Array>;

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(stat.size),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}