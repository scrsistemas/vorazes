export type VideoCategory =
  | "Visão geral"
  | "Primeiros passos"
  | "Simulações"
  | "CBS e IBS"
  | "Relatórios"
  | "Funcionalidades";

export type Video = {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  durationSeconds: number;
  thumbnailUrl: string;
  // provider + externalId permitem trocar de YouTube/Vimeo sem mudar a UI
  provider: "youtube" | "vimeo";
  externalId: string;
};

// Preencha externalId com o ID real do vídeo quando estiver publicado.
// Enquanto vazio, a interface exibe um estado "em breve".
export const videos: Video[] = [
  {
    id: "visao-geral",
    title: "Conheça o Vorazes em 3 minutos",
    description:
      "Um passeio rápido pelas principais telas do sistema: simulações, importação de XML e dashboard.",
    category: "Visão geral",
    durationSeconds: 180,
    thumbnailUrl: "/videos/thumb-visao-geral.jpg",
    provider: "youtube",
    externalId: "",
  },
  {
    id: "primeira-simulacao",
    title: "Como fazer sua primeira simulação",
    description:
      "Passo a passo para cadastrar um cliente e simular os três regimes tributários.",
    category: "Primeiros passos",
    durationSeconds: 240,
    thumbnailUrl: "/videos/thumb-primeiros-passos.jpg",
    provider: "youtube",
    externalId: "",
  },
  {
    id: "importacao-xml",
    title: "Importando XMLs de compras e vendas",
    description:
      "Veja como organizar suas notas fiscais eletrônicas por competência mensal.",
    category: "Funcionalidades",
    durationSeconds: 210,
    thumbnailUrl: "/videos/thumb-importacao.jpg",
    provider: "youtube",
    externalId: "",
  },
];
