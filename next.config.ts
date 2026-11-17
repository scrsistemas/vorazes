import type { NextConfig } from "next";

const securityHeaders = [
  // X-Frame-Options e CSP.frame-ancestors: bloqueia o site em iframes
  // externos (cliquejacking). CSP 'frame-ancestors none' tem prioridade em
  // navegadores modernos; X-Frame-Options cobre os demais.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // CSP: recursos apenas do próprio domínio; pagamento acontece na página
  // hospedada do PagBank (redirecionamento, não iframe). 'unsafe-inline' em
  // script/style é necessário para os bootstraps do Next.js; 'unsafe-eval'
  // para o dev server do Turbopack (remover em produção se desejar endurecer).
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      // Só força HTTPS quando o site já é servido por https (produção);
      // em http (dev local) a diretiva quebraria os assets.
      ...(process.env.NODE_ENV === "production"
        ? ["upgrade-insecure-requests"]
        : []),
    ].join("; "),
  },
  // HSTS: só assimila quando o request chega por HTTPS (browser ignora em
  // http/localhost), então é seguro servir em desenvolvimento.
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000",
  },
];

const nextConfig: NextConfig = {
  // Build standalone: gera um pacote autocontido (server.js + node_modules
  // mínimo) para rodar em hospedagem compartilhada/cPanel via Node.js App.
  // O deploy é feito subindo a pasta `deploy/vorazes-site` por FTP.
  //
  // Na Vercel o standalone é ignorado e, no Next.js 16.3.x, deixa o build
  // falhando (ENOENT .next/next-server.js.nft.json — vercel/next.js#96646).
  // A Vercel define VERCEL=1, então lá usamos o build padrão dela.
  output: process.env.VERCEL ? undefined : "standalone",
  // O instalador é lido por /api/download em tempo de execução, fora do
  // grafo de imports. Inclui o arquivo no bundle da função na Vercel.
  outputFileTracingIncludes: {
    "/api/download": ["./data/installers/**/*"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;