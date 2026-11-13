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
// TEMPORÁRIO (teste): valor reduzido para validar o checkout no PagBank.
// Para voltar ao valor comercial, use price: 150 e total: 1800.
export const plans: Plan[] = [
  {
    id: "vorazes",
    name: "Vorazes",
    description:
      "Acesso completo ao sistema Vorazes para contadores, escritórios e empresas.",
    price: 0.1,
    total: 1,
    installments: 10,
    contractMonths: 10,
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
