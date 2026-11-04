# Amazon merchant-fulfilled listings and inventory workflow

| Field | Value |
|---|---|
| APIs | Listings Items API v2021-08-01; Product Type Definitions API v2020-09-01; Feeds API for bulk JSON listings |
| Scope | Seller listings and merchant-fulfilled quantity; FBA inbound/inventory is out of scope |
| Evidence | Official documentation reviewed; no sandbox or production tests performed |
| Last checked | 2026-11-04 |

## Scope and ownership

This workflow publishes a seller's available-to-sell quantity for an existing Amazon listing. Decide the source of truth first: the warehouse or inventory service owns physical stock and allocations, while Amazon reports the resulting marketplace listing/offer state. Do not overwrite Amazon-fulfilled/FBA inventory with the merchant's warehouse count.

A marketplace ID identifies a specific Amazon store; use the correct regional SP-API endpoint and marketplace ID. See [SP-API endpoints](https://developer-docs.amazon/sp-api/docs/sp-api-endpoints) and [Store Identifiers](https://developer-docs.amazon/sp-api/docs/store-identifiers).

## Flow

```text
Warehouse stock event or scheduled reconciliation
  → calculate channel-available MFN quantity
  → resolve seller + store + SKU + listing/product type
  → validate schema and channel mapping
  → PATCH Listings Items API or submit a bulk JSON_LISTINGS_FEED
  → inspect submission issues and processing outcome
  → read back listing state and reconcile
```

## Step-by-step

### 1. Resolve item identity and target store

Use the seller's SKU as the seller-listing identity for the target Amazon marketplace; store the Amazon `marketplaceId` and regional endpoint separately. Validate whether the offer is merchant-fulfilled or FBA and confirm that the intended update applies to that fulfillment channel. Never infer the target store from SKU format.

### 2. Calculate available-to-sell stock

Define an explicit inventory rule in the integration. A common starting point is:

```text
available_to_publish = max(0, on_hand - reserved_or_committed - safety_stock)
```

The formula is an integration policy, not an Amazon rule. Confirm how your warehouse represents damaged, quarantined, inbound, reserved, and multi-location units. Avoid racing concurrent order reservations and stock events; serialize or version updates per seller/store/SKU as appropriate.

Do not publish a quantity for one channel that includes units already reserved for another channel. Keep FBA quantities in their Amazon-fulfilled flow, and do not change a live listing quantity to zero merely because a warehouse feed was delayed.

### 3. Validate listing attributes and product type

For creation or broad content updates, obtain the current product type definition and required attributes for the seller account and marketplace through the [Product Type Definitions API](https://developer-docs.amazon/sp-api/docs/product-type-definitions-api). Product schemas and requirements can vary by product type, seller/vendor type, and Amazon store. Validate data before submission and track listing issues after submission.

For an existing listing quantity update, use the smallest appropriate partial update. Amazon's [Listings Items API guide](https://developer-docs.amazon/sp-api/docs/listings-items-api) documents a `merge` update for the `quantity` field within `fulfillment_availability`, without requiring unrelated optional attributes such as `restock_date` and `lead_time_to_ship_max_days`. The exact patch payload, fulfillment channel code, and requirements must follow the current API reference and the specific seller/listing context.

Avoid using `putListingsItem` for a quantity-only update unless replacing the whole listing is intentional. Amazon documents that fields omitted from a full `putListingsItem` replacement may be removed from the existing listing.

### 4. Choose one-item or bulk submission

- For individual listing changes, use Listings Items API operations such as `patchListingsItem`.
- For suitable bulk listing changes, consider the Feeds API `JSON_LISTINGS_FEED`, which Amazon documents as the bulk equivalent of Listings Items API with aligned schemas.

Do not choose a feed solely because it seems faster. Review current feed schema, rate limits, processing state, notification behavior, and failure reporting. A feed submission being accepted is not proof every listing update succeeded.

### 5. Submit with idempotent state tracking

Track a local desired quantity and a submission record per seller/store/SKU. Use stable idempotency or deduplication in your integration so retried stock events do not create uncontrolled writes. Coalesce rapid inventory changes and publish the latest desired value rather than replaying every obsolete intermediate value.

Record only non-sensitive metadata: seller/store configuration key, SKU where permitted, request timestamp, operation/response code, Amazon request ID, and an internal correlation ID. Never log auth headers, refresh/access tokens, buyer data, or raw private seller payloads.

### 6. Inspect processing and read back

Listings Items write responses can indicate acceptance for processing and validation issues; downstream processing can surface additional issues later. Use the appropriate read operation, such as `getListingsItem`, to inspect current listing data, issues, and fulfillment availability. For feeds, track the feed document/report/processing status and any completion notification. Keep the desired and observed quantities separate so drift is visible.

### 7. Reconcile and recover

Reconcile a bounded set of SKUs against Amazon listing state at a controlled rate. If observed quantity differs from the desired value, determine whether the cause is a seller-fulfilled sale, an Amazon processing issue, another integration writing to the same listing, or an internal inventory update. Do not blindly resend the same full listing. Quarantine invalid attributes and review listing issue messages before retrying.

## Failure handling

| Condition | Recommended handling |
|---|---|
| Missing SKU/listing or wrong marketplace | Stop; correct mapping and store scope before retry. |
| Product-type/schema issue | Refresh the official definition, correct required attributes, and resubmit only after validation. |
| Permission or role error | Check app authorization and requested roles; do not loop retries. |
| 429 throttling | Back off with jitter and observe `x-amzn-RateLimit-Limit` when available; avoid hardcoded assumptions. |
| Submission accepted but later issue | Read back listing issues or feed results, classify, and repair. |
| Duplicate/out-of-order stock event | Use versioned desired state or event timestamp and deduplicate before writing. |
| Amazon state differs from warehouse | Reconcile and identify the writer/source of truth; don't overwrite blindly. |

## Testing

Use the [SP-API Sandbox](https://developer-docs.amazon/sp-api/docs/sp-api-sandbox), verifying whether the chosen operation supports static or dynamic tests. Amazon describes static sandbox responses as mocks and notes that sandbox is not for scalability testing. Test quantity-only patches, schema errors, zero stock, bursty updates, duplicate events, throttling handling, feed processing failures, and read-back drift using synthetic data.

**Testing status:** not tested for this repository. Do not call this workflow production-validated until specific scenarios, region, seller type, API version, and sandbox/live test scope are recorded.

## Official references

- [Listings Items API](https://developer-docs.amazon/sp-api/docs/listings-items-api)
- [Manage Product Listings guide](https://developer-docs.amazon/sp-api/docs/manage-product-listings-guide)
- [Product Type Definitions API](https://developer-docs.amazon/sp-api/docs/product-type-definitions-api)
- [Usage Plans and Rate Limits](https://developer-docs.amazon/sp-api/docs/usage-plans-and-rate-limits)
- [SP-API endpoints](https://developer-docs.amazon/sp-api/docs/sp-api-endpoints)
- [Store Identifiers](https://developer-docs.amazon/sp-api/docs/store-identifiers)
- [SP-API Sandbox](https://developer-docs.amazon/sp-api/docs/sp-api-sandbox)
