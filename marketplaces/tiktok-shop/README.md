# TikTok Shop Partner API

**Status:** expanded from a single operation into a source-linked API directory covering the major TTS API domains. **Evidence:** official documentation review only; no app authorization, API, sandbox, or production calls were performed. **Coverage:** broad API-family mapping plus focused guides for authorization, products, orders, fulfillment, logistics, returns/refunds, finance, events, and development. Operation-level schemas remain on the live Partner Center references.

TikTok Shop Partner Center and TikTok for Developers are separate documentation and access contexts. This playbook covers the **TikTok Shop TTS API**, not Login Kit, Content Posting, Research API, or other TikTok for Developers products.

## Start here

- [API directory and workflow map](apis/)
- [Development guide](guides/development-guide.md)
- [Authorization and token lifecycle](apis/authorization.md)
- [Products API](apis/products.md)
- [Order API](apis/orders.md)
- [Fulfillment, logistics, and finance](apis/fulfillment.md)
- [Returns, refunds, and cancellations](apis/returns-refunds.md)
- [Events and operational reliability](apis/events.md)
- [Get Authorized Category Assets · 202405](apis/authorized-category-assets.md)

## API domains covered by the official overview

The official [TTS API overview](https://partner.tiktokshop.com/docv2/page/tts-api-concepts-overview) lists Product, Order, Fulfillment, Return & Refund, Logistics, Promotion, Finance, Seller, Authorization, Events, Data Reconciliation, and Supply Chain APIs. Access depends on the app, authorization principal, enabled scopes, entity tag, registration region, target market, and endpoint version.

The current directory documents the first ten domains at a family level and goes deeper on the core seller integration path. Promotion, Seller, Data Reconciliation, and Supply Chain are mapped with their official boundaries but do not yet have operation-by-operation dossiers here. This distinction prevents a family inventory from being mistaken for a complete generated SDK or a universal endpoint list.

## Access and regions

TikTok Shop authorization is OAuth-based. Seller, creator, and partner/TAP flows use different authorization entry points and return different `user_type` values. The token endpoints are shared, but the API endpoint, scope, entity tag, and shop identifier requirements are operation-specific. The app's registration region and the seller's target market affect availability; confirm both in Partner Center.

The partner-specific [Get Authorized Category Assets](https://partner.tiktokshop.com/docv2/page/get-authorized-category-assets-202405) operation remains a separate permission check. Its category asset cipher is not a seller authorization token and should not be treated as proof that product, order, or shop APIs are available.

## Reliability baseline

Use webhooks for timely signals and API reads for authoritative state. Persist raw provider identifiers and `request_id`, deduplicate notifications, follow pagination, refresh tokens before expiry, back off on rate limits, and reconcile products, orders, fulfillment, returns, and finance independently. API success means the request was processed; it does not necessarily mean an asynchronous business operation completed.

## Coverage and verification

**Officially documented** means the linked Partner Center page states the fact. **Recommended implementation** is an engineering practice, not a TikTok guarantee. **Mapped** means the official overview confirms the API family while the exact operation set remains on the live reference. No page in this repository claims live account access or production testing.

**Last reviewed:** 2026-11-10.
