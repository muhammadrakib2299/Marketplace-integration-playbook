---
title: Amazon Listings Items API dossier
api: Listings Items API
version: 2021-08-01
checked: 2026-11-06
evidence_status: Official API reference, use-case guide, and versioned model opened and reviewed; no sandbox or live account tests performed
---

| Field | Value |
|---|---|
| Scope | Operation-level dossier for Listings Items API v2021-08-01 only |
| Operations | `deleteListingsItem`, `getListingsItem`, `patchListingsItem`, `putListingsItem`, `searchListingsItems` |
| Evidence status | Amazon’s official API reference, use-case guide, and official versioned model were opened and reviewed on 2026-11-06. No sandbox or live account tests were performed. |
| Payloads | JSON request bodies for PUT/PATCH; other operations have no request body. Successful responses and modeled errors are JSON. |

This API reads and submits a selling partner’s listings. Amazon identifies v2021-08-01 as the current version, lists v2020-09-01 as legacy, and describes the API as available to sellers and vendors. A listing’s submitted attributes and live values such as fulfillment availability may differ. Use the product type definitions surface for product-type requirements; do not treat a listing response as a catalog-wide product record.[1] [2]

## Operation inventory

| Operation ID | HTTP method and path | Required inputs | Success response |
|---|---|---|---|
| `deleteListingsItem` | `DELETE /listings/2021-08-01/items/{sellerId}/{sku}` | `sellerId`, `sku`, `marketplaceIds` (one maximum); optional `issueLocale` | `200` — `ListingsItemSubmissionResponse`; submission acceptance is represented in its `status` |
| `getListingsItem` | `GET /listings/2021-08-01/items/{sellerId}/{sku}` | `sellerId`, `sku`, `marketplaceIds`; optional `issueLocale`, `includedData` | `200` — `Item` |
| `patchListingsItem` | `PATCH /listings/2021-08-01/items/{sellerId}/{sku}` | `sellerId`, `sku`, `marketplaceIds`, JSON body with `productType` and `patches`; optional `includedData`, `mode`, `issueLocale` | `200` — `ListingsItemSubmissionResponse`; inspect `status` and `issues` |
| `putListingsItem` | `PUT /listings/2021-08-01/items/{sellerId}/{sku}` | `sellerId`, `sku`, `marketplaceIds` (one maximum), JSON body with `productType` and `attributes`; optional `includedData`, `mode`, `issueLocale` | `200` — `ListingsItemSubmissionResponse`; inspect `status` and `issues` |
| `searchListingsItems` | `GET /listings/2021-08-01/items/{sellerId}` | `sellerId`, `marketplaceIds`; optional filters, sort, `pageSize`, `pageToken`, `includedData`, `issueLocale` | `200` — `ItemSearchResults` |

All operation IDs, paths, methods, and success schema names in this table match the versioned model and Amazon reference. No additional operations appear in the v2021-08-01 model.[2] [3]

## `deleteListingsItem`

**Request:** `DELETE /listings/2021-08-01/items/{sellerId}/{sku}`. Required path parameters are `sellerId` (selling partner identifier) and `sku` (seller-provided listing identifier). Required query `marketplaceIds` is a comma-delimited list limited to one Amazon store ID. Optional `issueLocale` localizes issue messages; absent it defaults to the first marketplace’s language, with `en_US` fallback if the requested localization is unavailable. There is no request body. The versioned model declares `application/json` globally, but the operation defines no body parameter.[2]

**Response:** `200` returns `ListingsItemSubmissionResponse`, whose required fields are `sku`, `status`, and `submissionId`, with optional `issues` and `identifiers`. A `200` means Amazon understood the submission request; it does not itself guarantee completion or successful listing removal. The documented status values are `ACCEPTED`, `INVALID`, and `VALID`; `VALID` is documented only for validation preview, which does not apply to this delete operation. Read the returned status and issues.[1] [2]

## `getListingsItem`

**Request:** `GET /listings/2021-08-01/items/{sellerId}/{sku}`. Required path parameters are `sellerId` and `sku`; required `marketplaceIds` is a CSV query array. Optional `issueLocale` behaves as described above. Optional `includedData` selects response datasets; the default is `summaries`. Supported values are `summaries`, `attributes`, `issues`, `offers`, `fulfillmentAvailability`, `procurement`, `relationships`, and `productTypes`. No request body is defined.[2]

**Response:** `200` returns an `Item`, which requires `sku` and can include the requested datasets. A response may include issues that occurred after a listing submission was accepted and processed; this differs from the immediate submission response. The API overview also cautions that `attributes` reflects the latest data supplied by the selling partner, while datasets such as `fulfillmentAvailability` represent live listing data.[1] [2]

**Runnable-style Python (`httpx`):** Supply an SP-API access token through the environment; this example uses placeholders and does not include credentials. Configure `SP_API_BASE` for the marketplace's SP-API region. Amazon's current connection guide lists `host`, `x-amz-access-token`, `x-amz-date`, and `user-agent` as request headers; the HTTP client supplies `host`. This example includes the other documented headers.[8]

```python
import os
from datetime import datetime, timezone
from urllib.parse import quote

import httpx

base = os.environ.get("SP_API_BASE", "https://sellingpartnerapi-na.amazon.com")
seller_id = "SELLER_ID"
sku = "SELLER_SKU"
marketplace_id = "MARKETPLACE_ID"
headers = {
    "x-amz-access-token": os.environ["SP_API_ACCESS_TOKEN"],
    "x-amz-date": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
    "user-agent": "MarketplaceIntegrationPlaybook/1.0 (Language=Python)",
}
url = f"{base}/listings/2021-08-01/items/{quote(seller_id, safe='')}/{quote(sku, safe='')}"

response = httpx.get(
    url,
    params={"marketplaceIds": marketplace_id, "includedData": "summaries,issues"},
    headers=headers,
    timeout=30.0,
)
response.raise_for_status()
print(response.json())
```

The query and response shape follow `getListingsItem`; no request body is sent.[2] [3]

## `patchListingsItem`

**Request:** `PATCH /listings/2021-08-01/items/{sellerId}/{sku}`. Required path parameters are `sellerId` and `sku`; required query `marketplaceIds` is limited to one store. Optional `includedData` defaults to `issues` and supports `identifiers` and `issues`. Optional `mode` currently has the enum value `VALIDATION_PREVIEW`; optional `issueLocale` localizes issues. There is no requirement to send optional parameters unless needed.[2]

The required `application/json` body follows `ListingsItemPatchRequest`: required string `productType` and required `patches` array with at least one `PatchOperation`. Each patch operation requires `op` and `path`. Documented `op` values are `add`, `replace`, `merge`, and `delete`; `path` is a JSON Pointer. The model describes optional `value` as an array of objects. Amazon’s operation description states only top-level listing attributes can be patched; nested attributes cannot be patched. The API overview describes `merge` support for quantity in `fulfillment_availability` and deleting prior `quantity_discount_plan` values under `purchasable_offer`; it says merge is not supported for other attributes outside those areas.[1] [2]

**PATCH versus PUT:** PATCH is the partial-update operation and accepts explicit patch operations. PUT creates a listing or replaces its existing content; omitted existing attributes may be dropped. Prefer PATCH when changing only selected top-level attributes, but follow the product type schema and operation-specific documented limitations. This recommendation is an implementation choice based on Amazon’s documented semantics, not a guarantee of the outcome for every attribute.[1] [2]

**Response:** `200` returns `ListingsItemSubmissionResponse`. Check `status` and `issues`. `mode=VALIDATION_PREVIEW` requests validation without normal submission: the response may report `VALID` or `INVALID`; `VALID` is only returned for preview. Without preview, `ACCEPTED` means accepted for processing, not that subsequent processing succeeded. Amazon states that immediate PUT/PATCH/DELETE responses do not include issues that arise after acceptance.[1] [2]

**Quantity-only merge example (`httpx`):** This uses the documented `fulfillment_availability` merge use case; the JSON body is a `ListingsItemPatchRequest` with a single `PatchOperation`. Confirm the product type and fulfillment channel are appropriate for the listing. Set `VALIDATION_PREVIEW=1` to send a validation-only request; omit `mode` for normal submission.[1] [2] [7] [8]

```python
import os
from datetime import datetime, timezone
from urllib.parse import quote

import httpx

base = os.environ.get("SP_API_BASE", "https://sellingpartnerapi-na.amazon.com")
seller_id = "SELLER_ID"
sku = "SELLER_SKU"
marketplace_id = "MARKETPLACE_ID"
product_type = "PRODUCT_TYPE"
quantity = 12
headers = {
    "x-amz-access-token": os.environ["SP_API_ACCESS_TOKEN"],
    "x-amz-date": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
    "user-agent": "MarketplaceIntegrationPlaybook/1.0 (Language=Python)",
    "content-type": "application/json",
}
url = f"{base}/listings/2021-08-01/items/{quote(seller_id, safe='')}/{quote(sku, safe='')}"
params = {"marketplaceIds": marketplace_id}
if os.getenv("VALIDATION_PREVIEW") == "1":
    params["mode"] = "VALIDATION_PREVIEW"
body = {
    "productType": product_type,
    "patches": [{
        "op": "merge",
        "path": "/attributes/fulfillment_availability",
        "value": [{"fulfillment_channel_code": "DEFAULT", "quantity": quantity}],
    }],
}

response = httpx.patch(url, params=params, headers=headers, json=body, timeout=30.0)
response.raise_for_status()
result = response.json()
print(result)  # Inspect status, submissionId, and issues; ACCEPTED is not completion.
```

The model requires `productType` and a non-empty `patches` array; each operation has `op` and JSON Pointer `path`, with the value represented as an array of objects.[2] The guide specifically documents quantity merge on this top-level attribute; merge is not generally supported for arbitrary attributes.[1] In preview mode interpret `VALID`/`INVALID` as validation outcomes rather than a normal listing submission. A normal `ACCEPTED` result only confirms acceptance for processing; read the listing back after processing with `getListingsItem` and inspect returned details/issues for downstream results.[1] [2]

## `putListingsItem`

**Request:** `PUT /listings/2021-08-01/items/{sellerId}/{sku}`. Required path parameters are `sellerId` and `sku`; required `marketplaceIds` is limited to one store. Optional `includedData` defaults to `issues` and supports `identifiers` and `issues`. Optional `mode` accepts `VALIDATION_PREVIEW`; optional `issueLocale` localizes issues. The required `application/json` body follows `ListingsItemPutRequest`: `productType` (string) and `attributes` (object keyed by attribute name) are required. Optional `requirements` accepts `LISTING`, `LISTING_PRODUCT_ONLY`, or `LISTING_OFFER_ONLY`. The model describes these as all listing data (product facts and sales terms), product facts only, or sales terms only, respectively.[1] [2]

Amazon defines PUT as create-or-fully-update. Existing attributes can be removed when omitted from the submitted content. For example, the overview warns that an offer-only submission that omits bullet points can remove those existing bullet points. Treat PUT as replacement semantics, not as a partial merge. Use the Product Type Definitions API to obtain current requirements for the product type and marketplace.[1] [2]

**Response:** `200` returns `ListingsItemSubmissionResponse`. Inspect `status` and `issues`: `ACCEPTED` indicates accepted for processing; it does not report downstream processing issues. With `VALIDATION_PREVIEW`, `VALID` or `INVALID` can be returned, and the request is for preview rather than normal publication.[1] [2]

## `searchListingsItems`

**Request:** `GET /listings/2021-08-01/items/{sellerId}`. Required path `sellerId` identifies the selling partner; required query `marketplaceIds` is a CSV array. The operation can search a set of marketplaces within the same region, unlike the single-marketplace restriction documented on the per-SKU read and write operations. Optional `issueLocale` localizes issue text. Optional `includedData` defaults to `summaries`; its supported values are `summaries`, `attributes`, `issues`, `offers`, `fulfillmentAvailability`, `procurement`, `relationships`, and `productTypes`. No request body is defined.[2]

Search/filter query parameters are:

| Parameter | Documented behavior and constraints |
|---|---|
| `identifiers` | Optional CSV product identifiers; maximum 20. Required when `identifiersType` is provided. Mutually exclusive with `variationParentSku` and `packageHierarchySku`. |
| `identifiersType` | Required when `identifiers` is provided. Enum: `ASIN`, `EAN`, `FNSKU`, `GTIN`, `ISBN`, `JAN`, `MINSAN`, `SKU`, `UPC`. |
| `variationParentSku` | Optional filter to variation children of the specified SKU. Mutually exclusive with `identifiers` and `packageHierarchySku`. |
| `packageHierarchySku` | Optional filter for listing items containing or contained by the specified SKU. Mutually exclusive with `identifiers` and `variationParentSku`. |
| `createdAfter`, `createdBefore` | Optional ISO 8601 date-time bounds; include items created at or after / at or before the respective value. |
| `lastUpdatedAfter`, `lastUpdatedBefore` | Optional ISO 8601 date-time bounds; include items updated at or after / at or before the respective value. |
| `withIssueSeverity` | Optional array filter; supported values `WARNING`, `ERROR`. |
| `withStatus`, `withoutStatus` | Optional status filters; supported values `BUYABLE`, `DISCOVERABLE`. `withStatus` includes items with a specified status; `withoutStatus` excludes items containing specified statuses. |
| `sortBy` | Optional enum `sku`, `createdDate`, `lastUpdatedDate`; default `lastUpdatedDate`. |
| `sortOrder` | Optional enum `ASC`, `DESC`; default `DESC`. |
| `pageSize` | Optional number of results per page; default 10, maximum 20. |
| `pageToken` | Optional opaque token for a specific page. Use a returned token unchanged. |

The successful `ItemSearchResults` response requires `numberOfResults` and `items`; it may include `pagination`. Amazon documents a total ceiling of 1,000 listing items/SKUs that can be returned and paged through, regardless of the matching result count. `Pagination` can contain `nextToken` and/or `previousToken`; when the last page is reached, there is no `nextToken` key. This is a bounded search surface, not an unbounded export mechanism.[2]

## Shared access, regions, media types, and rate plans

Amazon lists all five operations in regions NA, EU, and FE. Each operation requires at least one of the **Inventory and Order Tracking** or **Product Listing** roles. The API overview identifies the audience as sellers and vendors. This family-level availability and role table do not establish that a specific app is authorized, a selling partner has granted access, or a particular marketplace/product type is usable. The official API overview lists a static sandbox, but no sandbox or live account tests were performed for this dossier.[1]

The model declares `application/json` as global request and response media type. GET and DELETE operations define no request body. PUT and PATCH bodies are JSON. The reference/model document `x-amzn-RequestId` for responses and `x-amzn-RateLimit-Limit` where specified/available. Model-stated default usage plans are `getListingsItem` 5 requests/second, burst 10; `putListingsItem` 5/10; `patchListingsItem` 5/5; `deleteListingsItem` 5/5; and `searchListingsItems` 5/5. Amazon explicitly notes that applied limits can differ by selling partner/application and the rate-limit header reports the applied rate when available. These defaults are not a promise of a particular account’s quota.[2] [3] [4]

## Asynchronous behavior, pagination, and errors

PUT, PATCH, and DELETE are submission operations. A successful HTTP `200` carries an application-level status and `submissionId`; `ACCEPTED` means accepted for processing, not a final processing result. `VALIDATION_PREVIEW` is available on PUT/PATCH and returns validation outcome rather than submitting the listing normally. Amazon says post-acceptance issues are not included in the immediate submission response; retrieve the listing with `getListingsItem` to inspect its current details and processed issues. The reference/model do not document a submission-status polling operation, completion SLA, or callback lifecycle for these operations. Do not invent one. GET is a direct read. Search pagination is synchronous and token-based, subject to the 1,000-item ceiling.[1] [2]

Every operation models `400`, `403`, `413`, `415`, `429`, `500`, and `503` error responses using `ErrorList`; `getListingsItem` and `searchListingsItems` additionally model `404`. `ErrorList` requires an `errors` array. Each `Error` requires `code` and `message`, with optional `details`. Amazon’s documented meanings and clearly separated handling recommendations are below.[2]

| HTTP status | Amazon-documented meaning | Implementation recommendation (not Amazon guarantee) |
|---|---|---|
| `400` | Missing/invalid parameters or request cannot be parsed. | Correct the request; do not retry unchanged. |
| `403` | Forbidden; possible causes include access denied, unauthorized, expired token, or invalid signature. | Verify authorization, role, token, signing, and account access. |
| `404` | Specified resource does not exist. Only modeled for GET and search. | Treat as not found where appropriate; verify identifiers and marketplace. |
| `413` | Request size exceeded maximum accepted size. | Reduce or correct request size. |
| `415` | Request payload uses unsupported format. | Check content type and JSON serialization. |
| `429` | Request frequency exceeded allowed rate. | For reads, use bounded exponential backoff with jitter and respect `Retry-After` if present. For writes, reconcile an uncertain outcome before retrying. |
| `500` | Unexpected condition prevented server from fulfilling request. | For reads, bounded exponential backoff with jitter is reasonable. For writes, reconcile an uncertain outcome before retrying. |
| `503` | Temporary overload or maintenance. | For reads, bounded exponential backoff with jitter is reasonable. For writes, reconcile an uncertain outcome before retrying. |

Correct invalid 4xx requests (including malformed payloads) rather than retrying them unchanged. Stop and resolve authorization, token, signature, or role denial on `403`; do not keep retrying. Bound read retries for `429` and transient `5xx` with exponential backoff and jitter. If a write times out or returns an ambiguous transient failure, do not blindly replay it: read back the affected listing and reconcile its current state before deciding whether to submit again. These are client safety recommendations, not Amazon guarantees.[1] [2]

Amazon’s role/region and rate-limit claims above are the documented availability statements, not a certification of account eligibility. Operation-specific business approval, catalog restrictions, and product-type support can still affect outcomes. Amazon notes that fully supported product types vary by seller/vendor type and store; for partially supported types, offer-only submissions for existing ASINs and partial updates via product type `PRODUCT` are described as supported. Check current PTD guidance before relying on a specific product type.[1]

## Safe workflow notes

For an initial listing review, use `searchListingsItems` with narrow marketplace and date/status criteria, follow every returned page token, and account for the 1,000-SKU ceiling. For complete baselines or high-volume writes, Amazon points to the `JSON_LISTINGS_FEED` bulk path; the Listings Items API itself accepts updates one at a time.[1] [2] [6]

Before writing, retrieve product-type requirements and validate attribute shapes against the current Product Type Definitions schema.[5] Prefer PATCH for narrowly scoped supported changes; choose PUT only when the replacement set is intentional and complete for the selected requirements. Use validation preview where appropriate, inspect returned issues, and then read the listing again after processing to see later issues/current state. These are implementation recommendations grounded in documented operation behavior, not Amazon-mandated workflows or completion guarantees.

Keep seller SKU, seller identity, and marketplace context together in stored records; do not assume SKU alone is globally unique. Preserve submission IDs, status, issue severity/code/message, and request IDs for diagnosis. Apply bounded retries only for transient failures or throttling; avoid replaying a write blindly when the submission outcome is uncertain. No sandbox or live account tests were performed, and no production behavior is claimed.

## Official references

[1]: https://developer-docs.amazon.com/sp-api/docs/listings-items-api "Listings Items API overview, use cases, considerations, and roles"
[2]: https://github.com/amzn/selling-partner-api-models/blob/main/models/listings-items-api-model/listingsItems_2021-08-01.json "Official versioned Listings Items API model v2021-08-01"
[3]: https://developer-docs.amazon.com/sp-api/reference/getlistingsitem "Listings Items API operation reference"
[4]: https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits "SP-API usage plans and rate limits"
[5]: https://developer-docs.amazon.com/sp-api/docs/product-type-definitions-api "Product Type Definitions API overview"
[6]: https://developer-docs.amazon.com/sp-api/docs/feeds-api-v2021-06-30-reference "Feeds API v2021-06-30 reference"
[7]: https://developer-docs.amazon.com/sp-api/reference/patchlistingsitem "Listings Items API patchListingsItem operation reference"
[8]: https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api "Amazon's current SP-API connection and request-header guide"
