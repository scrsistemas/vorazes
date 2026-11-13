export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "O que é o Vorazes?",
    answer:
      "O Vorazes é um software de planejamento e simulação tributária. Ele ajuda empresas, contadores e profissionais fiscais a analisar cenários e comparar regimes de tributação com base nos dados informados.",
  },
  {
    question: "Quem pode utilizar o sistema?",
    answer:
      "Contadores, escritórios de contabilidade, consultores tributários e empresas que querem acompanhar de perto seu próprio planejamento fiscal.",
  },
  {
    question: "Como funciona a simulação?",
    answer:
      "Você informa dados como faturamento, setor de atividade e folha de pagamento, e o Vorazes apresenta uma comparação entre os regimes tributários com base nesses dados.",
  },
  {
    question: "O Vorazes substitui o meu contador?",
    answer:
      "Não. O Vorazes é uma ferramenta de análise e apoio à decisão. As simulações não substituem a orientação de um contador ou consultor tributário habilitado.",
  },
  {
    question: "Como faço para baixar o sistema?",
    answer:
      "Após concluir sua assinatura, o instalador correspondente à sua licença fica disponível na área de downloads da sua conta.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "Os pagamentos são processados pelo PagSeguro. Assim que o pagamento é confirmado, sua conta é atualizada automaticamente.",
  },
  {
    question: "Posso cancelar minha assinatura?",
    answer:
      "Sim. Você pode gerenciar ou cancelar sua assinatura a qualquer momento pela área da sua conta.",
  },
  {
    question: "Como recebo suporte?",
    answer:
      "Pelo e-mail de suporte ou pelo formulário de contato disponível na área de Suporte do site.",
  },
];
