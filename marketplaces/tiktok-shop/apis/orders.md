# Order API

**Coverage:** official-reference review only. No order data was retrieved and no shop account was tested. Use the live [Order API overview](https://partner.tiktokshop.com/docv2/page/order-api-overview) and operation references for current fields, scopes, versions, and market behavior.

The Order API supports order-list and order-detail retrieval. TikTok also provides order-status webhooks. An order contains an order ID, SKU IDs, and line-item IDs; a line can contain multiple units of the same SKU. Keep all three identifiers in the integration model because fulfillment and return actions may address different levels.

## Status model

| Status | Integration meaning |
|---|---|
| `UNPAID` | Order placed but payment is not complete. |
| `ON_HOLD` | Payment completed and the remorse period is active; fulfillment is not allowed. Buyer address and information may be unavailable through the Order API. |
| `AWAITING_SHIPMENT` | Seller must arrange shipment. |
| `PARTIALLY_SHIPPING` | Some, but not all, order items have shipped. |
| `AWAITING_COLLECTION` | Logistics order exists and at least one package awaits carrier collection. |
| `IN_TRANSIT` | Packages have been collected and at least one is undelivered. |
| `DELIVERED` | All items have been delivered. |
| `COMPLETED` | Order is complete; return/refund eligibility may have ended. |
| `CANCELLED` | Order was cancelled by buyer, seller, TikTok system, or operator. |

Status transitions depend on region, business mode, remorse windows, carrier tracking, and after-sales rules. Do not assume one global state machine or infer fulfillment completion from a single webhook.

## Synchronization design

Use a bounded incremental read strategy for order list operations, follow every pagination mechanism documented by the endpoint, and persist the provider cursor or time window with the raw response. Fetch order detail before creating a fulfillment or financial record. Treat webhooks as low-latency hints: deduplicate by event identity where available, enqueue processing, fetch current order state, and reconcile out-of-order events.

When an order is created, TikTok documents that the buyer may not yet have paid. Inventory systems should reserve or hold stock according to the shop's business rules, then release or adjust it when payment, cancellation, or fulfillment state changes. Preserve the provider status and cancellation reason rather than collapsing everything into a local `cancelled` boolean.

## Returns and cancellations

Order status is connected to the Return & Refund API, but return/refund actions are not merely order updates. Model an order, package, return request, refund, and line item separately. Region and business-mode rules affect cancellation windows and after-sales periods; read the current endpoint references before making automated decisions.

## Official sources

- [Order API overview](https://partner.tiktokshop.com/docv2/page/order-api-overview)
- [TTS API overview](https://partner.tiktokshop.com/docv2/page/tts-api-concepts-overview)
- [Order status webhook](https://partner.tiktokshop.com/docv2/page/650300b8a57708028b430b4a)
- [Order list reference](https://partner.tiktokshop.com/docv2/page/650aa8094a0bb702c06df242)
- [Order detail reference](https://partner.tiktokshop.com/docv2/page/650aa8ccc16ffe02b8f167a0)
