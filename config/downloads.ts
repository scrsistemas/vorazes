export type Download = {
  id: string;
  version: string;
  releaseDate: string; // ISO date
  platform: "Windows 10/11" | "macOS" | "Linux";
  /** Nome do arquivo no diretório privado de instaladores (não é público).
   *  Preencher quando o instalador for publicado. A entrega é feita via
   *  /api/download, que valida a assinatura no servidor. */
  fileName: string;
  sizeMb: number;
  changelog: string[];
  requirements: string[];
  requiresPurchase: boolean;
};

export const downloads: Download[] = [
  {
    id: "vorazes-win-1-0-0",
    version: "1.0.0",
    releaseDate: "2026-09-08",
    platform: "Windows 10/11",
    fileName: "",
    sizeMb: 84,
    changelog: [
      "Primeira versão pública do Vorazes",
      "Simulação de Simples Nacional, Lucro Presumido e Lucro Real",
      "Importação de XML de NF-e (compras e vendas)",
      "Dashboard com histórico de simulações",
    ],
    requirements: [
      "Windows 10 ou superior (64 bits)",
      "4 GB de RAM (mínimo)",
      "200 MB de espaço em disco",
      "Conexão com a internet para ativação",
    ],
    requiresPurchase: true,
  },
];
