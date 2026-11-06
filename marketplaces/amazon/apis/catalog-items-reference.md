---
title: Amazon Catalog Items API dossier
api: Catalog Items API
version: 2022-04-01
checked: 2026-11-06
evidence_status: Official reference and versioned model opened and reviewed; no sandbox or live account tests performed
---

| Field | Value |
|---|---|
| Scope | Operation-level dossier for Catalog Items API v2022-04-01 only |
| Operations | `searchCatalogItems`, `getCatalogItem` |
| Evidence status | Amazon’s official API reference, official versioned model, and role overview were opened and reviewed on 2026-11-06. No sandbox or live account tests were performed. |
| Payloads | Both operations are GET requests with no operation request-body schema. Successful and error responses are JSON. |

This page documents the shared Amazon catalog lookup surface. A catalog item is not a seller’s listing or offer, and these operations do not create or update listings. Amazon’s overview identifies v2022-04-01 as the current Catalog Items version and v0 and v2020-12-01 as legacy versions. Use the versioned reference/model again before implementation because Amazon can revise documentation and schemas.[1] [3]

## Operation inventory

| Operation ID | HTTP method and path | Purpose | Required / conditional inputs | Success response |
|---|---|---|---|---|
| `searchCatalogItems` | `GET /catalog/2022-04-01/items` | Search by identifiers or keywords and return catalog items with search metadata. | Required `marketplaceIds` (one maximum). If `identifiers` is supplied, `identifiersType` is required; if type is `SKU`, `sellerId` is required. `identifiers` and `keywords` are mutually exclusive. | `200` — `ItemSearchResults` |
| `getCatalogItem` | `GET /catalog/2022-04-01/items/{asin}` | Retrieve details for one ASIN in a marketplace. | Required path `asin` and query `marketplaceIds`. | `200` — `Item` |

The operation IDs, methods, paths, parameters, and response schema names above match the official reference and the `paths` entries in the versioned OpenAPI model.[1] [2] There are no other operations in this API version’s model.

## `searchCatalogItems`

**Request:** `GET /catalog/2022-04-01/items`. The operation has no request body. The model declares JSON as the API’s general consumes/produces media type, but defines no body parameter for this GET. Inputs are query parameters; the successful response is JSON `ItemSearchResults`.[1] [2]

| Query parameter | Required? | Documented constraints and meaning |
|---|---|---|
| `marketplaceIds` | Yes | CSV-formatted array, maximum one store/marketplace ID. |
| `identifiers` | No | CSV-formatted product identifier list, maximum 20. Cannot be sent with `keywords`. |
| `identifiersType` | Conditional | Required when `identifiers` is present. Enum: `ASIN`, `EAN`, `GTIN`, `ISBN`, `JAN`, `MINSAN`, `SKU`, `UPC`. |
| `sellerId` | Conditional | Required when `identifiersType=SKU`; the model describes it as a selling-partner identifier, such as a seller account or vendor code. |
| `keywords` | No | CSV-formatted keyword list, maximum 20. Cannot be sent with `identifiers`. |
| `brandNames` | No | CSV-formatted refinement for keyword-based searches; cannot be used with `identifiers`. |
| `classificationIds` | No | CSV-formatted refinement for keyword-based searches; cannot be used with `identifiers`. |
| `keywordsLocale` | No | Language of search keywords; defaults to marketplace primary locale. Cannot be used with `identifiers`. |
| `pageSize` | No | Results per page; default 10, maximum 20. |
| `pageToken` | No | Opaque token used to retrieve a specific page. The model describes `nextToken` and `previousToken` as tokens for forward/backward paging. |
| `includedData` | No | CSV datasets to include; default is `summaries`. Available values are `attributes`, `classifications`, `dimensions`, `identifiers`, `images`, `productTypes`, `relationships`, `salesRanks`, `summaries`, `vendorDetails`. |
| `locale` | No | Locale for localized summaries; defaults to marketplace primary locale. |

The response schema requires `numberOfResults` and `items`. It can also include `pagination` and `refinements`. For identifier searches, `numberOfResults` is the total matching item count; for keyword searches it is an estimate. The model documents a maximum of 1,000 ASINs that can be returned and paged through. Each page is bounded by `pageSize`; use returned pagination tokens rather than constructing tokens. Items and individual dataset fields can be absent because datasets are optional and requested selectively.[2]

## `getCatalogItem`

**Request:** `GET /catalog/2022-04-01/items/{asin}`. The path parameter `asin` and query parameter `marketplaceIds` are required. Optional query parameters are `includedData` (same dataset enum and `summaries` default as search) and `locale` (defaults to marketplace primary locale). There is no request body. The successful JSON response schema is `Item`.[1] [2]

`Item` requires `asin`. Optional properties include `attributes`, `classifications`, `dimensions`, `identifiers`, `images`, `productTypes`, `relationships`, `salesRanks`, `summaries`, and `vendorDetails`. Attribute values are structured by attribute name and conform to related product-type definitions. Relationships can include variation relationships. Amazon documents that `vendorDetails` are available only to vendors; do not assume that sellers can request or see them.[2] [3]

## Shared access, regions, and request constraints

Amazon’s role table states that both operations are available in NA, EU, and FE regions and require the **Product Listing** role (at least one required role). Amazon’s Catalog Items overview labels the API as available to Sellers and Vendors and indicates a static sandbox. These facts do not establish that a particular app or account has the role, authorization, marketplace access, or data visibility needed for a call.[3]

Choose the SP-API endpoint that corresponds to the target marketplace’s region, and pass that marketplace’s ID. A marketplace identifier is not interchangeable with a regional host. See Amazon’s endpoint and marketplace/store-ID references for current mappings.[4] [5]

The versioned model declares `application/json` globally for consumes and produces. Neither operation defines a request body, so a client should not send one. Both successful operation responses are JSON. The reference documents `x-amzn-RequestId` on success and `x-amzn-RateLimit-Limit` when available; error responses also identify which headers Amazon documents per status.[1] [2]

## Pagination, asynchronous behavior, and rate-limit evidence

These are synchronous request/response operations. Neither operation returns an asynchronous job identifier nor documents a polling, completion, notification, or callback lifecycle. Pagination applies only to `searchCatalogItems`: the response may carry next/previous tokens; submit the returned token unchanged as `pageToken`, and stop when the relevant token is absent or the documented 1,000-ASIN ceiling is reached. Keyword counts are estimates, not guaranteed totals.[2]

**Rate-limit source discrepancy:** the opened reference page’s rendered usage-plan text appears as rate 5 requests/second and burst 5 for the operations. The current versioned model JSON explicitly states rate 2 requests/second and burst 2. Because the official sources disagree, this dossier does not designate either as a reliable assigned limit. The reference says the `x-amzn-RateLimit-Limit` header reports the operation’s rate when available and that seller-specific plans may be higher; Amazon’s usage-plan guide should be consulted for current caller-specific behavior.[1] [2] [6]

**Implementation recommendations (not Amazon guarantees):** treat these GETs as read-only/idempotent; validate mutually exclusive search modes and conditional inputs before sending; use bounded backoff and jitter for throttling or transient service failures; avoid retrying unchanged malformed or denied requests; and use a shared limiter if multiple workers call the same operation. Do not hard-code either disputed published default as the account’s actual quota.

## Errors and response handling

The reference documents these error statuses for the API. Error bodies use `ErrorList`, containing an `errors` array; each `Error` requires a `code` and `message`, with optional `details`.[1] [2]

| HTTP status | Amazon-documented meaning | Safe handling recommendation |
|---|---|---|
| `400` | Missing/invalid parameters or request cannot be parsed. | Correct the request; do not retry unchanged. |
| `403` | Access forbidden; possible reasons include access denied, unauthorized, expired token, or invalid signature. | Check authorization, role, token, and request signing/access context. |
| `404` | Specified resource does not exist. | Treat as not found where appropriate; do not retry unchanged. |
| `413` | Request size exceeded maximum accepted size. | Reduce/fix request size. |
| `415` | Request payload is in unsupported format. | Review request media type; these GET operations have no body in the model. |
| `429` | Request frequency exceeded allowed rate. | Pause and retry conservatively; the exact assigned plan may differ. |
| `500` | Unexpected condition prevented server from fulfilling the request. | A bounded retry may be appropriate. |
| `503` | Temporary overload or maintenance. | A bounded retry may be appropriate. |

The recommendations are client-side engineering guidance, not additional Amazon-documented response semantics. Record request IDs for support/debugging, and do not log access tokens or unnecessarily retain full catalog payloads.

## Safe workflow notes

For product matching, search by a known identifier when available. Otherwise use a keyword query and inspect returned candidate items and refinements before selecting an ASIN. Request only needed `includedData`; use `getCatalogItem` for a targeted detail lookup when the search result does not contain required fields. Treat optional datasets and locale-specific content defensively.

Preserve marketplace context when storing results. A practical catalog identity key is `(marketplaceId, asin)`, rather than ASIN alone. Keep catalog facts distinct from seller SKU/offer state. If listing creation or updates are separately in scope, use the Listings Items API and Product Type Definitions API for their respective seller-listing operations and schemas; Catalog Items is not a write substitute.[7] [8]

No sandbox or live account tests were performed for this dossier. The document makes no claim that example requests, credentials, assigned rate limits, or account eligibility have been tested.

## Official references

[1]: https://developer-docs.amazon.com/sp-api/docs/catalog-items-api-v2022-04-01-reference "Catalog Items API v2022-04-01 Reference"
[2]: https://github.com/amzn/selling-partner-api-models/blob/main/models/catalog-items-api-model/catalogItems_2022-04-01.json "Official versioned Catalog Items API model"
[3]: https://developer-docs.amazon.com/sp-api/docs/catalog-items-api "Catalog Items API overview and role table"
[4]: https://developer-docs.amazon.com/sp-api/docs/sp-api-endpoints "SP-API endpoints"
[5]: https://developer-docs.amazon/sp-api/docs/store-identifiers "Amazon store identifiers"
[6]: https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits "Usage plans and rate limits"
[7]: https://developer-docs.amazon/sp-api/docs/listings-items-api "Listings Items API"
[8]: https://developer-docs.amazon/sp-api/docs/product-type-definitions-api "Product Type Definitions API"
