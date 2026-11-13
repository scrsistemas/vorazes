import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// OBS: em ambiente de desenvolvimento sem acesso à internet para o Google
// Fonts, usamos fontes de sistema como fallback. Em produção, trocar por
// next/font/google (Fraunces + Inter) para carregar as fontes reais:
//
// import { Fraunces, Inter } from "next/font/google";
// const fraunces = Fraunces({ variable: "--font-display", subsets: ["latin"], weight: ["400","500","600"], style: ["normal","italic"] });
// const inter = Inter({ variable: "--font-body", subsets: ["latin"], weight: ["400","500","600","700"] });
// E aplicar `${fraunces.variable} ${inter.variable}` no <body>.

export const metadata: Metadata = {
  title: "Vorazes | Planejamento e simulação tributária",
  description:
    "Vorazes é um software de planejamento tributário que ajuda empresas e contadores a simular cenários e comparar regimes de tributação com mais clareza.",
  openGraph: {
    title: "Vorazes | Planejamento e simulação tributária",
    description:
      "Analise cenários, simule impactos tributários e tome decisões com mais clareza.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
