# Evidências de integração — resumo

- Data: 2026-10-27T16:39:52.556Z
- Ambiente: sandbox
- Base: https://sandbox.api.pagseguro.com
- Plano: Vorazes (vorazes) — R$ 1.800,00
- Domínio informado (VORAZES_BASE_URL): http://localhost:3000

## Resultado

- Criar checkout: HTTP 403
- Mensagem: HTTP 403

## Arquivos

- `requests.md` — todas as requisições e respostas em formato legível
- `*.request.json` / `*.response.json` — os mesmos dados em JSON

## Para completar a evidência de homologação

1. Se o checkout foi criado, abra o link de pagamento e pague com um cartão
   de teste (sandbox): VISA `4539620659922097`, CVV `123`, validade `12/2026`.
   Lista oficial: https://developer.pagbank.com.br/docs/cartoes-de-teste
2. Salve o payload do webhook que sua rota `/api/pagseguro/webhook` recebeu.
3. Anexe esta pasta no formulário https://app.pipefy.com/public/form/2e56YZLK
   junto com e-mail/CNPJ da conta e o domínio do site.
