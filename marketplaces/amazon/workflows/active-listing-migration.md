# Migrate an existing Amazon seller catalog

This workflow is for moving a seller's existing Amazon listings into a new integration/WMS with minimal disruption. It separates baseline extraction from catalog enrichment, listing writes, inventory, and verification. It is an **official-documentation-based design**, not a tested migration or guarantee of completeness.

| Field | Value |
|---|---|
| Core APIs | Reports v2021-06-30, Listings Items v2021-08-01, Catalog Items v2022-04-01, Product Type Definitions v2020-09-01 |
| Optional workflows | Feeds v2021-06-30 for bulk writes, Notifications v1 for supported event signals, FBA Inventory v1 for FBA stock |
| Evidence | Official documentation reviewed 2026-11-05; no account or sandbox testing |

## Data objects: do not merge these into one record

| Object | What it represents | Primary source |
|---|---|---|
| Seller listing/offer | A seller's SKU in a marketplace, listing state, submitted attributes, price/fulfillment context. | Listings Items API and seller listing reports. |
| Catalog item | Shared Amazon product facts, often found by ASIN or product identifier. It does not prove this seller offers the item. | Catalog Items API. |
| Product type definition | Marketplace/product-type schema and attribute requirements for listing submissions. | Product Type Definitions API. |
| Inventory | Fulfillment quantities; FBA buckets and merchant-fulfilled sellable quantity have different owners and meanings. | FBA Inventory API for FBA; seller listing/warehouse sources for MFN. |
| Report | An asynchronous snapshot, not a live object or an atomic multi-marketplace transaction. | Reports API. |

Use `(sellingPartnerId, marketplaceId, sellerSKU)` as a practical seller-listing identity key. Keep ASIN and product identifiers as related catalog keys, not as a replacement for seller SKU.

## Stage 0 — Confirm migration scope and account access

Before importing data, confirm seller authorization, required roles, regional API host, authorized marketplace IDs, seller type, target warehouse, fulfillment scope (MFN/FBA), listing count, and the internal source of truth for SKU, brand, category, product type, variations, price, and quantity. These are product decisions; Amazon does not decide your cross-system conflict policy.

Create a migration record per seller and marketplace with a start time, source, filters, cursor/report ID, counts, errors, and last successful checkpoint. Do not include refresh tokens, buyer data, or raw secrets in this ledger.

## Stage 1 — Capture a baseline safely

### Option A: Reports API for broad export

For a large catalog or full historical listing-state review, request one of these reports **per marketplace**:

- `GET_MERCHANT_LISTINGS_ALL_DATA` to capture listing states broadly, including inactive records.
- `GET_MERCHANT_LISTINGS_DATA` when the defined goal is the Active Listings report.

Amazon's [report-type documentation](https://developer-docs.amazon.com/sp-api/docs/report-type-values-inventory) says only one marketplace per report is accepted. Although the generic request model allows a list, the report definition says only the first marketplace is used. Do not assume other requested marketplaces were included.

Lifecycle: `createReport` → persist `reportId` → poll `getReport` until terminal status → on `DONE`, request `getReportDocument` → download/decrypt/decompress as described by the response. The process is asynchronous; Amazon does not publish one universal completion SLA.

Parse the output as tab-delimited data, account for the UTF-8 BOM, and do not hard-code locale-specific headers. Amazon notes that a cached report may use different locale headers than the latest request. Store report generation/request times and source marketplace with every row.

### Option B: Listings Items search for detailed live records

Use `searchListingsItems` for current seller listing details. The current reference requires a seller ID and one marketplace ID per request. Request only needed `includedData`—for example `summaries,attributes,issues,fulfillmentAvailability,relationships,productTypes`—then follow each returned `nextToken` as `pageToken` until exhausted.

Important bounds in the current reference: `pageSize` max 20 and a documented 1,000-result ceiling across search pagination. Therefore, do not rely on this search alone as a complete export for a larger account. Use filters/time windows where appropriate and reconcile with per-marketplace reports. Listing state can change while pages are being collected; Amazon does not describe pagination as a point-in-time snapshot.

### Define “active” instead of guessing

Listings Items exposes `BUYABLE` (shoppers can purchase) and `DISCOVERABLE` (visible to shoppers). A visible offer may not currently be buyable. Preserve raw Amazon statuses and issues, and record the migration's business rule separately. Do not silently label only `BUYABLE` rows as every “active listing.”

## Stage 2 — Normalize and preserve source data

- Upsert by seller + marketplace + seller SKU. Keep duplicate observations idempotent.
- Preserve raw status, fulfillment channel, quantity/availability, price, product identifiers, ASIN, parent/child relationship, listing attributes, issues, source report/API, and observed timestamp.
- Do not merge separate seller SKUs just because they point to the same ASIN.
- Keep catalog attributes, seller-submitted listing attributes, and internal product-master fields in separate columns/objects with provenance.
- Record missing/conflicting identifiers and quarantine them for review instead of inventing ASIN, brand, product type, or category values.

## Stage 3 — Enrich category, brand, and product data

1. If a seller listing has an ASIN, request catalog fields needed from Catalog Items (for example `summaries`, `attributes`, `classifications`, `identifiers`, and `productTypes`). If it has only GTIN/UPC/EAN/ISBN, search by supported identifier and marketplace. Respect Catalog Items identifier/keyword constraints and operation limits.
2. Treat Catalog Items output as Amazon catalog facts, not proof of seller ownership and not a seller's complete offer. Catalog brand/classification may be absent or differ from a seller's desired listing fields.
3. Resolve a candidate product type. Then use PTD `searchDefinitionsProductTypes` and `getDefinitionsProductType` for the target marketplace. Include seller ID when seller-specific requirements/brand values are relevant and approved.
4. Validate seller-owned attributes against the current returned schema. Product type definitions are marketplace-specific and can change; cache with version/locale/marketplace metadata and refresh when definitions or product-type change notifications require it.
5. Define explicit field ownership. For example, catalog data can suggest a brand or browse classification, but do not overwrite the seller's own listing attributes without an approved mapping rule.

## Stage 4 — Dry-run and approve changes

Generate a migration preview that compares current Amazon state with target state. Show per marketplace counts for imported, skipped, ambiguous, invalid, and conflicting records. Require human approval before writes. Store the exact target SKU/marketplace, changed fields, schema reference, and planned operation so the write set can be audited and resumed.

Start with a small set of representative SKUs. Use Listings Items validation/preview capabilities where supported. Do not mass-delete and recreate listings as a shortcut: preserve seller SKU, existing offer state, variations, fulfillment channel, and fields not owned by the migration.

## Stage 5 — Apply changes with the right write mechanism

- Use Listings Items `put` only when a full create/replace is intentional and the full required listing payload is known. Omitted fields can be removed on full replacement.
- Use `patch` for a partial update such as a supported seller-fulfilled quantity change; ensure the correct marketplace and fulfillment channel.
- Use `JSON_LISTINGS_FEED` for suitable bulk writes. It supports one marketplace per feed. Amazon's FAQ lists 25,000 SKUs/feed and five submissions per five minutes; these are feed guidance, not a universal API throughput promise.
- Persist each request/feed ID and per-SKU result. Submission acceptance is not confirmation of downstream buyability or complete processing.
- Do not use retired legacy XML/flat-file SP-API listing feed types for new integrations; see Amazon's [deprecation announcement](https://developer-docs.amazon.com/sp-api/changelog/deprecation-of-feeds-api-support-for-xml-and-flat-file-listings-feeds).

## Stage 6 — Track asynchronous outcomes and reconcile

For a feed, use `createFeedDocument` → upload → `createFeed` → poll `getFeed` or consume a supported `FEED_PROCESSING_FINISHED` notification → retrieve and parse its result document. For listing issues/status, subscribe only to notification types supported for your application/destination. Events are signals; some event types are delayed, SQS messages can duplicate/reorder, and notifications do not necessarily contain full issue details.

After each write, read the listing back with Listings Items and inspect `issues`, current status, and fulfillment availability. Reconcile periodically with API reads or reports. Use overlapping update windows, idempotent upserts, durable checkpoints, bounded retries, and a full reconciliation cycle as engineering safeguards; they are not guarantees supplied by Amazon.

For large-catalog baselines, do not rely on status notifications alone. For missed notifications, feed ambiguity, changing listings during pagination, or report snapshots, make a controlled current-state read and compare to the local record.

## Stage 7 — Start ongoing synchronization separately

Only after the baseline is approved and reconciled should ongoing writes/stock sync begin. Choose one source of truth per field and fulfillment channel. MFN sellable quantity is not FBA stock. Use FBA Inventory API for FBA inventory summaries; use the listing/offer update workflow for seller-fulfilled quantities. An Active Listings report is not an exact live stock ledger.

A safe rollout is: baseline → dry-run → small canary → verify read-back → staged batches → final reconciliation → enable incremental sync → monitor drift and error rate. Set progress expectations from observed account-specific performance; the cited docs do not establish a universal migration duration.

## Failure and recovery matrix

| Condition | Safe response |
|---|---|
| Seller authorization or role missing | Stop affected calls; identify the missing role/consent step; do not retry-loop. |
| Report still queued/running | Continue status checks with bounded cadence; do not request duplicate reports merely because the first is asynchronous. |
| Report output has unexpected language/BOM/columns | Parse robustly and map headers; retain source artifact metadata; do not silently shift columns. |
| Search pages change during scan or hit ceiling | Continue bounded pages/filters and compare to report baseline; schedule reconciliation. |
| Missing or conflicting SKU/ASIN/brand/type | Quarantine for seller confirmation; never manufacture identity values. |
| PTD schema validation fails | Refresh correct marketplace/product-type schema and repair only the failed attributes. |
| Feed accepted but individual rows fail | Fetch processing report; classify row-level errors; retry corrected rows only. |
| 429 / temporary 5xx | Honor available rate headers; bounded exponential backoff with jitter; reduce concurrency. |
| Local state differs from Amazon | Read current seller listing; identify field owner and competing writer before updating. |

## Official references

- [Listing management workflow guide](https://developer-docs.amazon.com/sp-api/docs/building-listings-management-workflows-guide)
- [Listings Items search reference](https://developer-docs.amazon.com/sp-api/reference/searchlistingsitems)
- [Inventory report types](https://developer-docs.amazon.com/sp-api/docs/report-type-values-inventory)
- [Reports lifecycle](https://developer-docs.amazon.com/sp-api/docs/reports-api-v2021-06-30-use-case-guide)
- [Catalog Items API](https://developer-docs.amazon.com/sp-api/docs/catalog-items-api-v2022-04-01-reference)
- [Product Type Definitions API](https://developer-docs.amazon.com/sp-api/docs/product-type-api-use-case-guide)
- [Feeds API use-case guide](https://developer-docs.amazon.com/sp-api/docs/feeds-api-v2021-06-30-use-case-guide)
- [JSON listing feed schema](https://developer-docs.amazon.com/sp-api/docs/listings-feed-type-values)
- [Notification type values](https://developer-docs.amazon.com/sp-api/docs/notification-type-values)
- [Usage plans and rate limits](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits)
