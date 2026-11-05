# Amazon SP-API development guide

| Field | Value |
|---|---|
| API/version scope | Orders API v2026-01-01; Listings Items API v2021-08-01; Product Type Definitions API v2020-09-01; Notifications API v1 |
| Regions | North America, Europe, Far East; confirm each operation's coverage |
| Evidence | Official documentation review only; no sandbox or production requests tested |
| Last checked | 2026-11-05 |

## 1. Start with the correct Amazon API version

Amazon's [Orders API documentation](https://developer-docs.amazon/sp-api/docs/orders-api) says Orders API v0 is deprecated. The [deprecation schedule](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations) lists removal of the v0 order operations for March 27, 2027. Use Orders API v2026-01-01 for new order-sync work and follow the [migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide) for existing integrations. Check the schedule again during implementation and before deployment; do not treat an API reference's continued availability as evidence that the version is safe for new work.

## 2. Define the integration boundary

First decide whether the application serves one seller organization (private application) or multiple independent sellers (public application). Identify seller versus vendor scope, target countries and Amazon stores, merchant-fulfilled (MFN) versus Fulfillment by Amazon (FBA) responsibilities, and which system owns inventory and order state.

This starter focuses on seller MFN order ingestion and merchant-fulfilled listing quantity. It does not describe vendor purchasing/fulfillment, FBA inbound, FBA stock reconciliation, buyer messaging, tax reporting, or financial settlement. Add dedicated documents before claiming support for those paths.

## 3. Account, app, roles, and onboarding

Follow Amazon's [developer onboarding overview](https://developer-docs.amazon/sp-api/docs/onboarding-overview) and [authorization overview](https://developer-docs.amazon/sp-api/docs/authorizing-selling-partner-api-applications). Register the application in the appropriate Amazon developer portal and request only roles needed by the use case. The exact seller account, developer profile, approval, app type, roles, and authorization steps depend on the application and data requested. Public apps and private apps have different distribution and authorization paths; a public app's availability in the Selling Partner Appstore is subject to Amazon's review. For the step-by-step seller consent and verified connection journey, see the [seller onboarding guide](seller-onboarding).

Before implementation, record these specifics for the target account:

- Seller or vendor type, legal region, marketplace participation, and selected Amazon store IDs.
- Public versus private app type, application ID, OAuth redirect URLs, and approval state.
- Roles granted for each API operation, including any restricted role needed for personal data.
- Production and sandbox access, notification destinations, and contact/escalation route.

Never store real application secrets, refresh tokens, seller IDs, or callback secrets in the repository. Store them in an approved secret manager, separated by environment and seller authorization.

## 4. Authorization and request construction

Amazon's [connection guide](https://developer-docs.amazon/sp-api/docs/connecting-to-the-selling-partner-api) describes obtaining an LWA access token from the LWA token service with the application's client credentials and, for seller-authorized operations, the seller's refresh token. The access token expires after one hour. Use a refresh strategy that handles expiry and transient token-service failures without logging token values.

The connection guide specifies the SP-API host, `x-amz-access-token`, `x-amz-date`, and required `user-agent` (app name, version, and language). Restricted operations can require a Restricted Data Token rather than an ordinary LWA token; current Orders v2026-01-01 PII rules are different, as described below. Follow the live Amazon connection and API reference for the operation. Do not copy the illustrative credentials in provider examples.

Public apps use seller OAuth authorization; private apps use Amazon's self-authorization flow. Implement a safe reauthorization path for revoked or invalid seller access. Do not assume a universal annual reauthorization schedule; check the current authorization guidance for the app type and connection. Use least-privilege roles and treat tokens as passwords.

## 5. Endpoint and store routing

For each request, resolve the right regional endpoint and `marketplaceId`. Amazon documents three SP-API selling-region endpoint groups—North America, Europe, and Far East—in [SP-API endpoints](https://developer-docs.amazon/sp-api/docs/sp-api-endpoints); the mapping of countries to identifiers is in [Store Identifiers](https://developer-docs.amazon/sp-api/docs/store-identifiers). A marketplace ID identifies a specific Amazon store and is not a country code.

Build configuration per seller/store rather than hardcoding one host or marketplace ID globally. Confirm that the operation supports the selected region, seller account, and store before making requests.

## 6. Order synchronization surface

Use Orders API **v2026-01-01**. See the [`searchOrders` API reference](https://developer-docs.amazon/sp-api/reference/searchorders) and [`getOrder` API reference](https://developer-docs.amazon/sp-api/reference/getorder-3). The migration guide maps several older v0 operations to the consolidated v2026-01-01 `searchOrders` and `getOrder` operations, and supports `includedData` to select requested datasets.

For an incremental sync, use the documented created/updated time filter, target `marketplaceIds`, and request a page size appropriate to the operation. The API requires exactly one of `createdAfter` and `lastUpdatedAfter`; do not combine those with the incompatible before-filter parameters. Follow `nextToken` into the `paginationToken` request parameter until no next page is returned. Persist a safe sync watermark and use an overlap/reconciliation strategy for delayed updates. Do not advance the watermark until fetched records are durably processed.

The searchOrders reference currently lists a default usage-plan rate of 0.0056 requests/second and burst 20. This is a documented default, not a throughput promise: Amazon usage plans depend on the operation, seller/application pair, and store, and can change. Read the `x-amzn-RateLimit-Limit` header when available, but do not rely on its presence. On 429 responses, back off with jitter and reduce load; Amazon explicitly recommends event-driven approaches and fewer calls where practical. See [Usage Plans and Rate Limits](https://developer-docs.amazon/sp-api/docs/usage-plans-and-rate-limits).

## 7. PII and data minimization

The [Orders API migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide) states that Orders API v2026-01-01 does not require RDTs for its PII datasets, but the appropriate roles are still required. Use `includedData` to request only necessary fields. Buyer and recipient data can include sensitive information; separate it from general order status where possible, restrict access, redact logs, define retention/deletion, and ensure the implementation is authorized for its use. Do not treat the change in RDT mechanics as permission to collect or retain unnecessary data.

Other SP-API operations and older Orders API versions can require an RDT. Check the [Tokens API](https://developer-docs.amazon/sp-api/docs/tokens-api) and [role mappings](https://developer-docs.amazon/sp-api/docs/role-mappings) for the exact operation and data requested.

## 8. Listings and inventory surface

For a legacy seller account with many listings, use the separate [active listing migration workflow](../workflows/active-listing-migration) before enabling ongoing synchronization. That workflow distinguishes Reports snapshots, seller listings, shared catalog data, product type schemas, and fulfillment inventory.

Use Listings Items API v2021-08-01 for seller listing reads and single-SKU updates, together with Product Type Definitions for current attribute requirements. Amazon's [Listings Items overview](https://developer-docs.amazon/sp-api/docs/listings-items-api) documents `patchListingsItem` and a `merge` update for quantity within `fulfillment_availability`; the `JSON_LISTINGS_FEED` is the bulk counterpart for suitable workflows.

Avoid using a full `putListingsItem` payload for a quantity-only change unless the complete required listing is intentionally being replaced. Amazon documents that omitted attributes in a full replacement can be dropped. Validate the product type, marketplace, SKU, fulfillment channel, and schema before submission. A successful acceptance response does not prove downstream processing completed; check listing issues and resulting state with the appropriate read operation.

Do not combine MFN sellable quantity with Amazon-fulfilled/FBA inventory. Define one source of truth for each fulfillment channel and marketplace. Use Amazon's official [Manage Product Listings guide](https://developer-docs.amazon/sp-api/docs/manage-product-listings-guide) and [Product Type Definitions guide](https://developer-docs.amazon/sp-api/docs/product-type-definitions-api) for schemas and lifecycle details.

## 9. Notifications and reconciliation

Amazon's [Notifications API guide](https://developer-docs.amazon/sp-api/docs/notifications-api-v1-use-case-guide) allows subscriptions to supported events and delivery through Amazon EventBridge or SQS workflows. Prefer relevant event notifications over aggressive polling when the required notification type is supported. Notifications can be delayed or unavailable during outages, so Amazon recommends a backup retrieval mechanism. Combine events with a bounded `searchOrders` reconciliation process; deduplicate notifications and tolerate out-of-order events.

## 10. Reliability and state mapping

Use an internal canonical order state while preserving the raw Amazon status and timestamps. Map order status and fulfillment state deliberately; do not assume Amazon values align one-to-one with another channel. Store Amazon identifiers with the seller/store scope required by your system, and enforce idempotent upsert behavior for repeated pages, retries, and notifications.

Classify authentication/role errors, validation errors, throttling, transient server/network failures, and business-state conflicts. Retry only transient failures with bounded exponential backoff and jitter. Avoid blindly retrying writes that may have side effects. Record request IDs and non-sensitive error metadata, not tokens or buyer/recipient data.

## 11. Sandbox and testing

Use Amazon's [SP-API Sandbox](https://developer-docs.amazon/sp-api/docs/sp-api-sandbox) to test function behavior. Static sandbox calls return mocked responses; dynamic support varies by operation. Amazon says sandbox should not be used for scalability testing, and sandbox usage rates are not a substitute for production usage plans. Test authorization failures, token expiry, pagination, duplicate/out-of-order updates, throttling handling, malformed listings, listing issues, and reconciliation with synthetic data.

This guide has not been exercised against a sandbox or live selling-partner account. Do not label the workflows as tested until the specific scenarios and environment are recorded.

## 12. Observability and operations

Track per-seller/store sync lag, last successful page/watermark, 429 and error counts, token refresh failures, listing submission outcomes, and reconciliation differences. Alert on persistent lag and permission failures. Provide a safe reauthorization path and a controlled resync process. Check Amazon's [SP-API Health Dashboard information](https://developer-docs.amazon/sp-api/changelog/sp-api-health-dashboard), release notes, and deprecation schedule during maintenance.

## References and review date

Primary references are linked inline. Reviewed 2026-11-05. Recheck API versions, roles, endpoint mapping, quotas, and deprecation dates before implementation and on each material update.
