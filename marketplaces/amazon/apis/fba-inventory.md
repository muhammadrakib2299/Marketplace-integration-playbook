# Amazon SP-API FBA Inventory API v1

**Evidence status:** Checked 2026-11-06 against the Amazon-published OpenAPI model, FBA Inventory API page, and current API reference. The model contains four operation IDs, including three explicitly sandbox-only operations. **Tests:** None run; this is a reference dossier, not executable code. [1] [2] [4]

## Scope and operation table

The API exposes inventory summaries for an enrolled seller's inventory in Amazon's fulfillment network. The sole production operation is `getInventorySummaries`. `createInventoryItem`, `deleteInventoryItem`, and `addInventory` are marked sandbox-only by Amazon's model and must be directed to the SP-API sandbox, not treated as production stock management. Amazon's page lists NA, EU, and FE availability for each operation, with at least one of Amazon Fulfillment or Product Listing roles required. [1] [2] [4]

| Operation ID | Method and path | Success | Default rate / burst |
|---|---|---:|---:|
| `getInventorySummaries` | `GET /fba/inventory/v1/summaries` | 200 | 2 req/s / 2 |
| `createInventoryItem` (sandbox only) | `POST /fba/inventory/v1/items` | 200 | Not stated in model |
| `deleteInventoryItem` (sandbox only) | `DELETE /fba/inventory/v1/items/{sellerSku}` | 200 | Not stated in model |
| `addInventory` (sandbox only) | `POST /fba/inventory/v1/items/inventory` | 200 | Not stated in model |

Rates are model-published defaults where provided; the response header `x-amzn-RateLimit-Limit` reports the applied plan when available. Amazon may provide higher limits for specific selling partners. The three sandbox-only operation definitions do not publish rate/burst values. These are request/response operations, not asynchronous jobs. Only `getInventorySummaries` has pagination via opaque `nextToken`, which expires after 30 seconds. [2]

## Scope, granularity, and inventory meaning

**Marketplace scope.** `getInventorySummaries` requires `marketplaceIds` with exactly one marketplace ID; it also requires `granularityType=Marketplace` and `granularityId` set to that marketplace ID. The response echoes a granularity object. Inventory is therefore aggregated at marketplace level, not fulfillment-center level. The sandbox item methods instead use a marketplace ID in their body or query as indicated below. [2]

**What is returned.** Each summary can identify `asin`, Amazon `fnSku`, seller `sellerSku`, seller-described `condition`, localized `productName`, `lastUpdatedTime`, `totalQuantity`, enrolled `stores`, and—if requested—`inventoryDetails`. With `details=true`, detail quantities include fulfillable, inbound-working, inbound-shipped, inbound-receiving, reserved, researching, and unfulfillable quantities. `details` defaults to false, in which case the `inventoryDetails` object is absent. [2]

**Quantity semantics.** `fulfillableQuantity` is stock that can be picked, packed, and shipped. `totalQuantity` counts units in an inbound shipment or in Amazon fulfillment centers. Inbound-working means Amazon has been notified of inbound units; inbound-shipped means the shipment has also been provided a tracking number; inbound-receiving means units still awaiting receipt/processing in a shipment where some units have already been received and processed. Reserved quantity separates total reserved from customer orders, transfers between fulfillment centers, and FC processing. Unfulfillable is unsellable stock, broken out by customer-, warehouse-, distributor-, carrier-damaged, defective, and expired dispositions. Researching quantities are misplaced or warehouse-damaged stock being confirmed, with short (1–10 days), medium (11–20 days), and long (21+ days) categories. These definitions describe FBA network inventory, not the merchant's independent warehouse or seller-fulfilled offer quantity. The operation is not a general merchant-fulfilled inventory feed; Amazon documents seller-fulfilled inventory management separately. [2] [3]

`startDateTime` requests summaries changed since a timestamp no earlier than 18 months before the call. Amazon specifically notes that changes in `inboundWorkingQuantity`, `inboundShippedQuantity`, and `inboundReceivingQuantity` are not detected by this change filter. It takes precedence over and causes `sellerSkus` and `sellerSku` filters to be ignored. A `sellerSkus` list accepts at most 50 SKUs and takes precedence over `sellerSku`. Amazon's model directs callers paging change-filtered results to send both `startDateTime` and the prior `nextToken`. Tokens expire after 30 seconds. [2]

## Operation details

### `getInventorySummaries`

**Contract.** `GET /fba/inventory/v1/summaries`. Required query parameters: `details` (optional boolean, default `false`), `granularityType` (required enum `Marketplace`), `granularityId` (required string; marketplace ID), and `marketplaceIds` (required array, maximum one ID). Optional: `startDateTime` (ISO 8601 date-time, at most 18 months old), `sellerSkus` (array up to 50), `sellerSku` (one SKU), and `nextToken` (opaque string, expires in 30 seconds). Special characters in SKU query values must be URL encoded. No request body. [2]

**Selection and pagination.** With no `startDateTime`, `sellerSkus`, or `sellerSku`, returns all inventory summaries with available details. A start time returns changed summaries and overrides SKU filters; use it alongside `nextToken` to continue changed-results pagination. If `sellerSkus` is present, it overrides `sellerSku`. The response has `payload` containing required `granularity` and `inventorySummaries`, optional `pagination.nextToken`, and optional `errors`. A returned token indicates another page; absent token means no more pages. This is synchronous pagination, not asynchronous processing. [2]

**Responses.** `200 OK`: `GetInventorySummariesResponse`. Model-declared errors: `400` missing/invalid request; `403` forbidden (possible access denied, unauthorized, expired token, invalid signature, or resource not found); `404` specified resource absent; `429` request frequency exceeded; `500` unexpected server condition; `503` temporary overload or maintenance. The 200, 400, 404 responses declare `x-amzn-RateLimit-Limit` and `x-amzn-RequestId`; 403, 429, 500, 503 declare request ID. Error payload schema is `errors[]`, with required string `code` and optional `message` and `details`. Default rate/burst: 2/2. [2]

### `createInventoryItem` — sandbox only

**Contract.** `POST /fba/inventory/v1/items`, to a sandbox endpoint only. Required JSON body `createInventoryItemRequestBody`: `sellerSku` (string), `marketplaceId` (string), and `productName` (string), all required by the schema. This requests creation of product details in sandbox inventory; it does not create a production FBA listing or add production inventory. No pagination or async job behavior is described. [2]

**Responses.** `200 OK` with `CreateInventoryItemResponse` (optional `errors`); model errors: `400`, `403`, `404`, `429`, `500`, `503`, with common meanings given above. Responses declare `x-amzn-RequestId`; the model does not declare rate-limit headers or rate/burst values. [2]

### `deleteInventoryItem` — sandbox only

**Contract.** `DELETE /fba/inventory/v1/items/{sellerSku}`, to a sandbox endpoint only. Required path parameter `sellerSku` (string) and required query parameter `marketplaceId` (string). No body. This deletes an item from Sandbox Inventory only. It does not delete a live catalog contribution or production FBA SKU. No pagination or async job behavior is described. [2]

**Responses.** `200 OK` with `DeleteInventoryItemResponse` (optional `errors`); model errors: `400`, `403`, `404`, `429`, `500`, `503`. Responses declare `x-amzn-RequestId`; no rate/burst values are specified. [2]

### `addInventory` — sandbox only

**Contract.** `POST /fba/inventory/v1/items/inventory`, to a sandbox endpoint only. Required header `x-amzn-idempotency-token` (unique request token) and required JSON body `addInventoryRequestBody`. The body contains `inventoryItems`, an array of objects, each requiring `sellerSku` (string), `marketplaceId` (string), and `quantity` (integer). The model describes adding the desired amount to Sandbox Inventory. It does not establish live FBA receipt, seller-fulfilled stock publication, or inbound shipment workflows. No pagination or asynchronous job behavior is described. [2]

**Responses.** `200 OK` with `AddInventoryResponse` (optional `errors`); model errors: `400`, `403`, `404`, `429`, `500`, `503`. Responses declare `x-amzn-RequestId`; no rate/burst values are specified. [2]

## Facts versus recommendations

**Facts in the official contract:** there are four operation IDs; three explicitly sandbox-only; only inventory summaries are the documented production read operation. Summary retrieval requires one marketplace at marketplace granularity, can include detailed FBA quantities, and paginates with expiring tokens. The Amazon role page lists NA, EU, and FE for all four operations, each requiring at least one of Amazon Fulfillment or Product Listing. The OpenAPI model specifies status codes, schema, and the one published default rate plan. [1] [2]

**Recommendations, not Amazon guarantees:** URL-encode SKUs; store marketplace context with every result; request `details=true` only when the extra quantity breakdown is needed; follow opaque tokens promptly because they expire after 30 seconds; when consuming delta results, do not treat changes to the three noted inbound quantities as detectable by `startDateTime`; use a backoff strategy for throttling. Do not use sandbox mutation methods to infer or alter production stock. To obtain merchant-fulfilled stock, use the applicable listings/fulfillment integration rather than interpreting this FBA-network inventory endpoint as seller-warehouse inventory. [2] [3]

## References

[1]: https://developer-docs.amazon.com/sp-api/docs/fba-inventory-api "Amazon FBA Inventory API page and operation role mappings"
[2]: https://github.com/amzn/selling-partner-api-models/blob/main/models/fba-inventory-api-model/fbaInventory.json "Amazon SP-API FBA Inventory API v1 OpenAPI model"
[3]: https://developer-docs.amazon.com/sp-api/docs/understanding-amazon-listing-status-and-seller-fulfilled-inventory-management "Amazon guide to listing status and seller-fulfilled inventory management"
[4]: https://developer-docs.amazon.com/sp-api/reference/fba-inventory-v1 "Amazon FBA Inventory API v1 reference"
