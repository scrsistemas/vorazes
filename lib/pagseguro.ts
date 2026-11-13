// Camada de integração com o PagBank (PagSeguro).
//
// Usa a API de Checkout do PagBank (POST /checkouts), que gera um link de
// pagamento hospedado: o cliente é redirecionado para uma página segura do
// PagBank, paga, e volta para o site (redirect_url).
//
// Documentação oficial: https://developer.pagbank.com.br/reference/criar-checkout
//
// IMPORTANTE:
// - O token nunca deve ser exposto no frontend. Toda chamada aqui só roda
//   no servidor (esta função só deve ser chamada a partir de API routes).
// - Em ambiente de Sandbox, a base é https://sandbox.api.pagseguro.com
//   Em produção, a base é https://api.pagseguro.com

export type OrderStatus = "aprovado" | "pendente" | "recusado" | "cancelado";

export type CreateOrderInput = {
  planId: string;
  planName: string;
  /** Valor em reais (ex: 1800.00). Convertido para centavos ao enviar. */
  priceInReais: number;
  customerName: string;
  customerEmail: string;
  /** URL absoluta para onde o PagBank deve redirecionar após o pagamento. */
  redirectUrl: string;
  /** URL absoluta que receberá as notificações (webhook) de status. */
  notificationUrl: string;
};

export type CreateOrderResult = {
  orderId: string;
  status: OrderStatus;
  /** Link de pagamento hospedado do PagBank, para redirecionar o cliente. */
  checkoutUrl: string | null;
};

// Normaliza valores vindos do .env / do painel da hospedagem: tira aspas
// acidentais e espaços nas pontas. Sem isso, `PAGSEGURO_ENV=production ` (com
// espaço ou maiúscula) caía no sandbox e o token de produção era rejeitado
// com "Invalid credential. Review AUTHORIZATION header."
function envValue(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (value.length > 1) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1).trim();
    }
  }
  return value;
}

// Aceita as variações que aparecem no painel da hospedagem ("Production",
// "prod", "produção"). Sem isso, um valor não previsto caía silenciosamente
// no sandbox e o token de produção era rejeitado com 401.
function normalizeEnv(raw: string): "mock" | "sandbox" | "production" {
  const value = raw.toLowerCase();
  if (value === "mock") return "mock";
  if (["production", "prod", "producao", "produção"].includes(value)) {
    return "production";
  }
  if (value && value !== "sandbox") {
    console.warn(
      `[pagbank] PAGSEGURO_ENV="${raw}" não reconhecido; usando "sandbox". ` +
        `Valores válidos: mock, sandbox, production.`
    );
  }
  return "sandbox";
}

const PAGBANK_TOKEN = envValue(process.env.PAGSEGURO_TOKEN);
const PAGBANK_ENV = normalizeEnv(envValue(process.env.PAGSEGURO_ENV)); // "mock" | "sandbox" | "production"
// O modo mock é opt-in explícito (PAGSEGURO_ENV=mock). Nunca pode ser
// ativado por acidente (variável ausente/errada), senão um deploy de
// produção sem token libera acesso sem pagamento.
const PAGBANK_MOCK = PAGBANK_ENV === "mock";
const PAGBANK_CONFIGURED = PAGBANK_TOKEN.length > 0;

function baseUrl() {
  return PAGBANK_ENV === "production"
    ? "https://api.pagseguro.com"
    : "https://sandbox.api.pagseguro.com";
}

// Monta o corpo enviado ao endpoint POST /checkouts. Exportado para que o
// script de evidências (scripts/coletar-evidencias-pagbank.mts) use o MESMO
// payload da aplicação, sem risco de divergir com o tempo.
export function buildCheckoutBody(input: CreateOrderInput) {
  const amountInCents = Math.round(input.priceInReais * 100);

  return {
    reference_id: `${input.planId}-${Date.now()}`,
    customer_modifiable: true, // cliente completa dados (CPF etc.) na tela do PagBank
    customer: {
      name: input.customerName,
      email: input.customerEmail,
    },
    items: [
      {
        name: `Assinatura Vorazes — ${input.planName}`,
        quantity: 1,
        unit_amount: amountInCents,
      },
    ],
    // Limita o parcelamento do cartão ao máximo de parcelas sem juros do
    // contrato (12x), mesmo que o painel do PagBank permita mais parcelas.
    payment_methods_configs: [
      {
        type: "CREDIT_CARD",
        config_options: [
          { option: "INSTALLMENTS_LIMIT", value: String(12) },
          { option: "INTEREST_FREE_INSTALLMENTS", value: String(12) },
        ],
      },
    ],
    notification_urls: [input.notificationUrl],
    redirect_url: input.redirectUrl,
  };
}

// Compra única: valor total do plano, parcelado no cartão em até 12x sem
// juros. O parcelamento é definido nas configurações do PagBank (máximo de
// parcelas sem juros) e a página de pagamento oferece a opção ao cliente.
export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  if (!PAGBANK_CONFIGURED) {
    // Fail closed: sem token não se aprova pagamento nenhum. O modo mock
    // existe só para exercitar o fluxo de UI e precisa ser pedido de forma
    // explícita (PAGSEGURO_ENV=mock) — caso contrário um deploy de produção
    // com a variável faltando cairia aqui e liberaria o download de graça.
    if (!PAGBANK_MOCK) {
      throw new Error(
        PAGBANK_ENV === "production"
          ? "PagBank não está configurado em produção (token ausente)."
          : "PagBank não está configurado (PAGSEGURO_TOKEN ausente). " +
              "Use PAGSEGURO_ENV=mock para testar a interface sem pagamento real."
      );
    }
    return {
      orderId: `MOCK-${Date.now()}`,
      status: "aprovado",
      checkoutUrl: null,
    };
  }

  const body = buildCheckoutBody(input);

  const response = await fetch(`${baseUrl()}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const apiMessage =
      data?.error_messages?.[0]?.description ??
      data?.error_messages?.[0]?.message ??
      `HTTP ${response.status}`;

    // Diagnóstico sem vazar o token: ambiente, base usada e tamanho do token.
    console.error("[pagbank] checkout recusado", {
      status: response.status,
      env: PAGBANK_ENV,
      base: baseUrl(),
      tokenLength: PAGBANK_TOKEN.length,
      message: apiMessage,
    });

    // 403 allowlist_access_required NÃO é lista de IPs: segundo a tabela de
    // erros do PagBank, significa que o vendedor ainda não foi homologado
    // para usar o Checkout em produção. O sandbox continua funcionando.
    if (
      data?.error_messages?.[0]?.error === "allowlist_access_required" ||
      /allowlist access required/i.test(apiMessage)
    ) {
      console.error(
        "[pagbank] conta não homologada para produção. " +
          "Solicite a homologação em https://app.pipefy.com/public/form/2e56YZLK " +
          "informando e-mail/CNPJ da conta e o domínio usado no site."
      );
      throw new Error(
        "A conta do PagBank ainda não está homologada para vendas em produção. " +
          "Solicite a homologação ao PagBank e tente novamente."
      );
    }

    // 401 / "Invalid credential" sempre é token x ambiente incompatível:
    // token de sandbox só vale em sandbox.api.pagseguro.com e vice-versa.
    if (response.status === 401 || /invalid credential/i.test(apiMessage)) {
      throw new Error(
        `Credencial do PagBank rejeitada (${apiMessage}). ` +
          `A aplicação está em "${PAGBANK_ENV}" usando ${baseUrl()}, ` +
          `com um token de ${PAGBANK_TOKEN.length} caracteres. ` +
          `Use o token do MESMO ambiente (sandbox e produção não trocam) e ` +
          `lembre que gerar um novo token invalida o anterior na hora.`
      );
    }

    throw new Error(apiMessage);
  }

  const payLink: string | null =
    data?.links?.find((l: { rel: string; href: string }) => l.rel === "PAY")
      ?.href ?? null;

  if (!data?.id) {
    throw new Error(
      "PagBank respondeu sem identificador de checkout; não foi possível iniciar o pagamento."
    );
  }

  return {
    orderId: data.id,
    status: "pendente", // status real só é confirmado via webhook
    checkoutUrl: payLink,
  };
}

// Usado pelo endpoint de webhook para consultar o status real de um
// checkout/assinatura. O PagBank não usa assinatura HMAC simples no
// payload — por segurança, sempre reconsultamos a API diretamente em vez
// de confiar apenas no conteúdo recebido na notificação.
export async function fetchCheckoutStatus(
  checkoutId: string
): Promise<OrderStatus> {
  if (!PAGBANK_CONFIGURED) return "pendente";

  const response = await fetch(`${baseUrl()}/checkouts/${checkoutId}`, {
    headers: {
      Authorization: `Bearer ${PAGBANK_TOKEN}`,
      accept: "application/json",
    },
  });

  if (!response.ok) return "pendente";

  const data = await response.json();
  const checkoutStatus: string | undefined = data?.status;
  const chargeStatus: string | undefined =
    data?.charges?.[0]?.status ?? data?.subscription?.status;

  if (chargeStatus === "PAID" || checkoutStatus === "PAID") return "aprovado";
  if (chargeStatus === "DECLINED" || chargeStatus === "FAILED")
    return "recusado";
  if (checkoutStatus === "INACTIVE" || chargeStatus === "CANCELED")
    return "cancelado";
  return "pendente";
}
