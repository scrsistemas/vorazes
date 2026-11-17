export type Plan = {
  id: string;
  name: string;
  description: string;
  /** Valor de cada parcela (reais) exibido como "em até 12x sem juros". */
  price: number;
  /** Total cobrado no cartão (reais), sem juros — é o valor da compra. */
  total: number;
  /** Quantidade máxima de parcelas do parcelamento. */
  installments: number;
  /** Duração do contrato em meses (sem cancelamento durante o período). */
  contractMonths: number;
  features: string[];
  highlighted: boolean;
  active: boolean;
};

// Contrato comercial único: 12 meses de acesso, pagos em uma única compra
// parcelada em até 12x sem juros no cartão (parcelamento definido no painel
// do PagBank). O contrato não pode ser cancelado durante o período.
//
// Valor comercial: R$ 1.800 à vista ou em até 12x de R$ 150 sem juros.
export const plans: Plan[] = [
  {
    id: "vorazes",
    name: "Vorazes",
    description:
      "Acesso completo ao sistema Vorazes para contadores, escritórios e empresas.",
    price: 150,
    total: 1800,
    installments: 12,
    contractMonths: 12,
    features: [
      "Simulações tributárias ilimitadas",
      "Clientes ilimitados",
      "Múltiplos usuários por escritório",
      "Importação de XML de NF-e (compras e vendas)",
      "Histórico completo de simulações",
      "Relatórios exportáveis",
      "Suporte prioritário",
    ],
    highlighted: true,
    active: true,
  },
];