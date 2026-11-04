# Amazon order synchronization workflow

| Field | Value |
|---|---|
| API | Orders API v2026-01-01 |
| Scope | Seller-side order discovery and warehouse ingestion; shipment execution is a separate workflow |
| Evidence | Official Amazon documentation reviewed; no sandbox or production tests performed |
| Last checked | 2026-11-04 |

## Version and access gates

Use Orders API v2026-01-01 for new work. Amazon marks Orders API v0 deprecated and lists removal of its order operations on **March 27, 2027** in the [SP-API deprecation schedule](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations). Existing v0 integrations need a migration plan based on Amazon's [migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide).

Before enabling a seller, verify app authorization, roles for the specific operation and datasets, selling-partner/store participation, regional endpoint, and marketplace ID. The app's access model and roles are not interchangeable between public and private applications.

## High-level flow

```text
Seller authorization
  → regional SP-API endpoint + marketplace ID
  → searchOrders using a durable time watermark
  → follow all pagination tokens
  → validate, deduplicate, and upsert order records
  → create or update the warehouse order
  → process only the applicable fulfilment path
  → receive supported notifications and periodically reconcile
```

## Step-by-step

### 1. Resolve account and regional configuration

Load the selling partner's authorized account, region endpoint, and the `marketplaceId` values to query. Amazon documents separate North America, Europe, and Far East hosts in [SP-API endpoints](https://developer-docs.amazon/sp-api/docs/sp-api-endpoints) and country/store IDs in [Store Identifiers](https://developer-docs.amazon/sp-api/docs/store-identifiers). Validate that each requested store is in the selected endpoint group.

### 2. Authorize the request

Exchange the authorized seller's LWA refresh token for an access token, include it in `x-amz-access-token`, and send the required `user-agent` and other documented headers. LWA access tokens expire after one hour; refresh and cache safely, but never log token values. See [Connect to SP-API](https://developer-docs.amazon/sp-api/docs/connecting-to-the-selling-partner-api).

### 3. Search incrementally

Call the current [`searchOrders` operation](https://developer-docs.amazon/sp-api/reference/searchorders). For ongoing sync, choose `lastUpdatedAfter` so changes to previously seen orders can be discovered; use `createdAfter` when the goal is a creation-time backfill. Amazon's current reference requires exactly one of `createdAfter` and `lastUpdatedAfter`; incompatible before-filters cannot be combined with them. Filter by the seller's relevant `marketplaceIds` and order/fulfilment states as needed.

Choose the smallest `includedData` set that meets the warehouse requirement. The API can return consolidated order information and items; optional datasets such as fulfilment, packages, buyer, recipient, proceeds, or tax data should be requested only when justified and authorized. Treat buyer and recipient datasets as sensitive even when an RDT is not required by the new version.

Persist the query window and start with a conservative overlap to tolerate timing and update delays. Deduplicate at storage time so overlap can be safely re-read. Do not move a watermark forward just because an HTTP response succeeded.

### 4. Drain pagination and persist before advancing

If the response includes `nextToken`, pass it as `paginationToken` to retrieve the next page, retaining the same logical search filters and account context. Continue until no next token is returned. Persist each page durably and idempotently. Advance the sync watermark only after every returned order/page has been recorded or explicitly quarantined for repair.

A stable local identity should include the selling-partner account, Amazon marketplace/store, and Amazon order ID. Preserve Amazon order/item IDs and original timestamps/statuses alongside any normalized internal values. Do not use buyer name or address as an identifier.

### 5. Validate and upsert the warehouse order

Validate required fields, order items, SKU mapping, quantities, currency, status, and fulfilment channel. Preserve unknown Amazon enum values and route unsupported conditions to a review queue rather than coercing them silently. Handle partial and cancelled orders according to the actual Amazon order state and your warehouse policy.

Use database uniqueness or an equivalent idempotency constraint so a retried request, overlapping search, or repeated notification cannot create duplicate warehouse orders. If an order is re-read, update mutable fields without resetting warehouse progress or overwriting a later internal decision.

### 6. Select the correct fulfilment path

Distinguish merchant-fulfilled (MFN) orders from Amazon-fulfilled (FBA) orders. Only route an order to a warehouse that is responsible for its fulfilment. FBA inventory and fulfilment are not the same as a merchant-fulfilled stock/order workflow.

Shipment creation, labels, dispatch confirmation, and tracking updates depend on the current Amazon API and fulfilment program. This guide intentionally does not prescribe a deprecated Orders API v0 shipment operation. Verify the supported current API, roles, region, and program-specific workflow before adding outbound shipment updates.

### 7. Use notifications where supported; keep reconciliation

Amazon's [Notifications API guide](https://developer-docs.amazon/sp-api/docs/notifications-api-v1-use-case-guide) supports destinations and subscriptions for notification types applicable to the seller/vendor and API. Use a supported order event for lower-latency updates where available. Make notification processing idempotent and tolerant of delay, duplicates, and out-of-order delivery.

Amazon recommends a backup mechanism for notification outages or delays. Run a bounded `searchOrders` reconciliation over a recent overlap and compare Amazon timestamps/statuses with local state. Notification delivery must not be the only recovery mechanism.

### 8. Handle rate limits and errors

Amazon's `searchOrders` reference currently lists default rate 0.0056 requests/second and burst 20. Actual usage plans can depend on seller/application/store and change; treat these figures as a reference point, not a service-level guarantee. Read `x-amzn-RateLimit-Limit` when available, without assuming the header is always present. Amazon documents HTTP 429 as retryable and recommends backoff; use bounded exponential backoff with jitter and reduce concurrency/poll frequency.

| Failure | Handling |
|---|---|
| Expired/invalid token or missing role | Stop retrying the same request; refresh token or guide the seller through authorization/role correction. |
| 400 validation error | Record sanitized request context and fix query/data; do not retry unchanged input. |
| 403 access denied | Check app type, seller consent, requested roles, marketplace participation, and region. |
| 429 throttling | Back off with jitter, respect current limits when known, and reduce work or switch to supported events. |
| 5xx/network timeout | Retry reads with bounded backoff; use idempotent upserts when repeating a search. |
| Invalid/unknown status or SKU | Quarantine for mapping/review; preserve source payload fields needed for safe resolution. |
| Page processing failure | Retry/replay from the last durable page and keep the watermark unchanged. |

## PII and data handling

Amazon's [Orders migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide) says v2026-01-01 uses role-based permissions rather than RDT generation for its PII datasets. This does not mean PII is unrestricted. Request `BUYER` or `RECIPIENT` only when necessary for the authorized fulfilment use case; limit access, encrypt appropriately, redact logs, define retention/deletion, and prevent sample payloads or customer details from entering Git history. Other SP-API versions and operations can have different RDT rules.

## State and verification record

| Claim | Evidence | Checked |
|---|---|---|
| Orders v0 is deprecated; v0 order operations are scheduled for removal 2027-03-27. | [Amazon deprecation schedule](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations) | 2026-11-04 |
| `searchOrders` supports created/updated filtering and pagination. | [searchOrders reference](https://developer-docs.amazon/sp-api/reference/searchorders) | 2026-11-04 |
| Notifications should have a backup retrieval/reconciliation mechanism. | [Notifications API guide](https://developer-docs.amazon/sp-api/docs/notifications-api-v1-use-case-guide) | 2026-11-04 |
| This workflow has been run against an Amazon account or sandbox. | **No — not tested.** | — |

## Official references

- [Orders API overview](https://developer-docs.amazon/sp-api/docs/orders-api)
- [Orders API v2026-01-01 migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide)
- [`searchOrders` reference](https://developer-docs.amazon/sp-api/reference/searchorders)
- [`getOrder` v2026-01-01 reference](https://developer-docs.amazon/sp-api/reference/getorder-3)
- [Deprecation schedule](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations)
- [Connect to SP-API](https://developer-docs.amazon/sp-api/docs/connecting-to-the-selling-partner-api)
- [Usage Plans and Rate Limits](https://developer-docs.amazon/sp-api/docs/usage-plans-and-rate-limits)
- [Notifications API guide](https://developer-docs.amazon/sp-api/docs/notifications-api-v1-use-case-guide)
