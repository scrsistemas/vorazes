# Requests enviados ao PagBank

- Gerado em: 2026-10-27T16:39:52.556Z
- Ambiente: **sandbox**
- Base: `https://sandbox.api.pagseguro.com`
- Token: 22 caracteres (valor omitido de propósito)
- Endpoint principal: `POST https://sandbox.api.pagseguro.com/checkouts`

> O header `Authorization` foi substituído por `<omitido>` para que este
> arquivo possa ser anexado em chamados sem expor a credencial.

## 1. POST https://sandbox.api.pagseguro.com/checkouts

**Resposta:** HTTP 403 em 275 ms

### Request headers

```json
{
  "accept": "application/json",
  "authorization": "Bearer <omitido>",
  "content-type": "application/json"
}
```

### Request body

```json
{
  "reference_id": "vorazes-1793119192558",
  "customer_modifiable": true,
  "customer": {
    "name": "Cliente Teste Homologacao",
    "email": "homologacao@exemplo.com"
  },
  "items": [
    {
      "name": "Assinatura Vorazes — Vorazes",
      "quantity": 1,
      "unit_amount": 180000
    }
  ],
  "payment_methods_configs": [
    {
      "type": "CREDIT_CARD",
      "config_options": [
        {
          "option": "INSTALLMENTS_LIMIT",
          "value": "12"
        },
        {
          "option": "INTEREST_FREE_INSTALLMENTS",
          "value": "12"
        }
      ]
    }
  ],
  "notification_urls": [
    "http://localhost:3000/api/pagseguro/webhook"
  ],
  "redirect_url": "http://localhost:3000/confirmacao?plan=vorazes&email=homologacao@exemplo.com"
}
```

### Response body

```json
{
  "cloudflare": "Attention Required! | Cloudflare",
  "hint": "Provável bloqueio WAF/rede (Cloudflare). Verifique IP ou rede."
}
```

---
