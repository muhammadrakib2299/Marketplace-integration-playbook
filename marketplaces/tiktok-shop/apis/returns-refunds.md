# Return & Refund API

**Coverage:** official-reference review only. No return, refund, exchange, or cancellation action was performed.

TikTok's Return & Refund API provides access to consumer return/refund information and supports seller review actions such as accepting or rejecting requests where the operation and authorization allow it. The official API overview describes this surface separately from the Order API, so a return or refund should not be represented as a simple order-status mutation.

## Integration model

Store an after-sales request with its own request ID, order ID, line-item IDs, reason, evidence, requested amount, decision, deadline, logistics state, and refund state. A return can involve a shipment back to the seller, an inspection outcome, an exchange path, a partial refund, or a full refund. The available transitions vary by region, business mode, policy, and current endpoint version.

Use the Order API to establish current order context, then call the return/refund operation documented for the request. Idempotency and replay protection are implementation requirements: a webhook or retry must not issue a second refund. Do not mark a refund complete when a request was only accepted; reconcile the provider's final financial state.

## Regional caution

TikTok's order documentation states that after-sales periods differ by region and business mode. The 2026 API update notices also indicate that return APIs can gain new fields and exchange-related behavior. Re-read the live reference and changelog before shipping an automated decision flow.

## Official sources

- [Return & Refund API overview](https://partner.tiktokshop.com/docv2/page/return-refund-and-cancel-api-overview)
- [Order API overview](https://partner.tiktokshop.com/docv2/page/order-api-overview)
- [TTS API overview](https://partner.tiktokshop.com/docv2/page/tts-api-concepts-overview)
- [TikTok Shop API changelog](https://partner.tiktokshop.com/docv2/page/kgigtxr7)
