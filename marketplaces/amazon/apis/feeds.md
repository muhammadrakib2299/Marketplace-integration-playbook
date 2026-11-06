# Amazon SP-API Feeds API v2021-06-30

**Evidence status:** Official sources reviewed 2026-11-06. Operation contracts below are verified against the Amazon-published OpenAPI model; workflow and role descriptions are checked against Amazon's use-case guide. **Tests:** None run; this is a reference dossier, not executable code.

## Scope and version

This dossier covers the six public operations in the Feeds API model `2021-06-30`: `cancelFeed`, `createFeed`, `createFeedDocument`, `getFeed`, `getFeedDocument`, and `getFeeds`. Base hosts depend on the selling-partner region; the model's default host is North America (`sellingpartnerapi-na.amazon.com`), with EU and Far East regional hosts used for those regions. [1] [2]

The guide documents NA, EU, and FE availability for each operation. `getFeed` and `getFeeds` list Amazon's Selling Partner Insights role among the roles that can authorize access; for all six operations the common documented role set is Amazon Fulfillment, Brand Analytics, Direct to Consumer Shipping (Restricted), Inventory and Order Tracking, Payment Initiation Service Provider (EU only), Pricing, Product Listing, and Tax Invoicing (Restricted). At least one applicable role is required. The guide's role tables say `getFeed` supports NA/EU/FE without a qualification; the other five say NA/EU/FE except where noted. [1]

**Do not use retired listing feed formats as current guidance.** Amazon explicitly says XML and flat-file product listing feeds are deprecated. `JSON_LISTINGS_FEED` is the current bulk listings feed type addressed here; feed-type eligibility and schema are feed-type-specific, so consult the current Feed Type Values and JSON listings documentation before constructing payloads. Other non-listings feed types may have their own format rules. [1] [3]

## Operations at a glance

| Operation ID | Method and path | Success | Default rate / burst |
|---|---|---:|---:|
| `cancelFeed` | `DELETE /feeds/2021-06-30/feeds/{feedId}` | 200 | 2 req/s / 15 |
| `createFeed` | `POST /feeds/2021-06-30/feeds` | 202 | 0.0083 req/s / 15* |
| `createFeedDocument` | `POST /feeds/2021-06-30/documents` | 201 | 0.5 req/s / 15 |
| `getFeed` | `GET /feeds/2021-06-30/feeds/{feedId}` | 200 | 2 req/s / 15 |
| `getFeedDocument` | `GET /feeds/2021-06-30/documents/{feedDocumentId}` | 200 | 0.0222 req/s / 10 |
| `getFeeds` | `GET /feeds/2021-06-30/feeds` | 200 | 0.0222 req/s / 10 |

Rates and bursts are model-published defaults, not guaranteed account-specific ceilings. Amazon may grant higher values, and `x-amzn-RateLimit-Limit` returns the applied rate when available. `createFeed` has a separate applicable limit for `JSON_LISTINGS_FEED`; do not assume its general 0.0083 rate applies to that feed type. [2] [4]

## Common asynchronous lifecycle

1. Call `createFeedDocument` with the feed payload's MIME `contentType`. Amazon returns a `feedDocumentId` and a presigned upload `url` that expires after five minutes. Upload the feed bytes to that URL directly, without calling another SP-API endpoint for the transfer. Send the content type matching the value used to create the document. For `JSON_LISTINGS_FEED`, use the JSON listings feed's documented content type/schema; do not substitute deprecated XML or flat-file listing types. [2] [3]
2. Call `createFeed` only after the upload completes. Its required body identifies `feedType`, one or more `marketplaceIds`, and the `inputFeedDocumentId`; optional `feedOptions` are string-valued and feed-type-specific. A `202 Accepted` response supplies the `feedId`. [2]
3. Poll `getFeed` or query `getFeeds` until `processingStatus` is terminal. Statuses are `IN_QUEUE`, `IN_PROGRESS`, `DONE`, `FATAL`, and `CANCELLED`. `DONE` does not mean every submitted record succeeded: inspect the result document. `FATAL` may indicate some, none, or all operations succeeded. `IN_QUEUE` can mean another feed is being processed. [2]
4. When `resultFeedDocumentId` is present, call `getFeedDocument`. It returns a presigned download URL, expiring after five minutes. Download promptly. If `compressionAlgorithm` is `GZIP`, decompress the downloaded contents; otherwise read directly. Optional `enableContentEncodingUrlHeader=true` requests `Content-Encoding: gzip` on the returned URL instead of `identity` when the result is GZIP, allowing compatible HTTP clients to decompress automatically. Interpret the report according to the submitted feed type. [2]

`getFeeds` supports JSON/listing feed monitoring like other feed types; its `feedTypes` filter is an array of up to ten values, and `JSON_LISTINGS_FEED` is a current feed type. The operation returns `feeds` plus an optional opaque `nextToken`. For subsequent pages, pass the token **alone**; combining it with any other query parameter fails. [2] [3]

## Operation details

### `createFeedDocument`

**Contract.** `POST /feeds/2021-06-30/documents`; required JSON body `contentType` (string). Success is `201 Created` with required `feedDocumentId` and presigned `url` for uploading. The URL expires after five minutes. [2]

**Errors.** Model responses: `400` missing/invalid parameters; `403` forbidden/access denied, unauthorized, expired token, or invalid signature; `404` resource not found; `413` request exceeds accepted size; `415` unsupported payload format; `429` rate exceeded; `500` unexpected server error; `503` temporary overload/maintenance. Error payload is `ErrorList` (`errors[]`, each with required string `code` and `message`, optional `details`). [2]

**Rate and practical note.** Default 0.5 requests/second, burst 15. This creates an upload destination only; it does not submit or process a feed. Upload using the returned URL before it expires. [2]

### `createFeed`

**Contract.** `POST /feeds/2021-06-30/feeds`; required JSON body properties: `feedType` (string), `marketplaceIds` (1–25 strings), and `inputFeedDocumentId` (string returned from `createFeedDocument`). Optional `feedOptions` is an object of string values. Amazon explicitly requires document contents be uploaded before this call. Success is `202 Accepted` with required `feedId`; uniqueness is scoped to the seller ID. [2]

**Errors.** `400`, `401`, `403`, `404`, `415`, `429`, `500`, `503`; descriptions follow the common error semantics below. The error body is `ErrorList`. [2]

**Rate and practical note.** Default 0.0083 requests/second, burst 15, subject to the `JSON_LISTINGS_FEED` exception noted in the rate-plan section. Acceptance is asynchronous submission, not processing completion. [2] [4]

### `getFeed`

**Contract.** `GET /feeds/2021-06-30/feeds/{feedId}`; required path parameter `feedId` (string, unique only with seller ID). `200` returns a `Feed`: required `feedId`, `feedType`, `createdTime`, and `processingStatus`; optional `marketplaceIds`, `processingStartTime`, `processingEndTime`, and `resultFeedDocumentId`. [2]

**Errors.** `400`, `401`, `403`, `404`, `415`, `429`, `500`, `503`; error body `ErrorList`. [2]

**Rate and practical note.** Default 2 requests/second, burst 15. Use the returned status and result document ID to decide when to retrieve the processing report. [2]

### `getFeedDocument`

**Contract.** `GET /feeds/2021-06-30/documents/{feedDocumentId}`; required path `feedDocumentId`; optional boolean query `enableContentEncodingUrlHeader`. `200` returns required `feedDocumentId` and presigned `url`, plus optional `compressionAlgorithm` (`GZIP`). The URL expires after five minutes. [2]

**Errors.** `400`, `401`, `403`, `404`, `415`, `429`, `500`, `503`; error body `ErrorList`. [2]

**Rate and practical note.** Default 0.0222 requests/second, burst 10. This operation returns URL metadata, not the report body itself; retrieve the document from that URL and decompress if indicated. [2]

### `getFeeds`

**Contract.** `GET /feeds/2021-06-30/feeds`; optional query parameters: `feedTypes` (1–10 strings), `marketplaceIds` (1–10 strings), `pageSize` (integer 1–100, default 10), `processingStatuses` (one or more of `CANCELLED`, `DONE`, `FATAL`, `IN_PROGRESS`, `IN_QUEUE`), `createdSince` and `createdUntil` (ISO 8601 date-times), or `nextToken` (string). Either `feedTypes` or `nextToken` is required. `feedTypes` may be combined with other filters and `pageSize`; `nextToken` must be sent alone. The default creation window begins 90 days ago and ends now; feeds are retained for at most 90 days. [2]

**Response.** `200` returns required `feeds` (array of `Feed`) and optional `nextToken` when there are more results than fit in the page. [2]

**Errors.** `400`, `401`, `403`, `404`, `415`, `429`, `500`, `503`; error body `ErrorList`. [2]

**Rate and practical note.** Default 0.0222 requests/second, burst 10. Keep pagination tokens opaque and do not reuse them with filters. [2]

### `cancelFeed`

**Contract.** `DELETE /feeds/2021-06-30/feeds/{feedId}`; required path `feedId` (string, unique only with seller ID). A successful `200` has no response body specified by the model. [2]

**Errors.** `400`, `401`, `403`, `404`, `415`, `429`, `500`, `503`; error body `ErrorList`. [2]

**Rate and practical note.** Default 2 requests/second, burst 15. The API name and success response alone should not be interpreted as a guarantee that a feed already processing can be rolled back; check its state and Amazon's cancellation behavior before relying on cancellation. [2]

## Shared error and response notes

All non-success response bodies use `ErrorList` with one or more errors. `401` denotes malformed/invalid authorization; `403` denotes forbidden access and can include access denied, unauthorized, expired token, or invalid signature; `404` means the resource is missing; `415` means an invalid/unsupported content type or payload format; `429` means request frequency exceeded the allowed rate; `500` and `503` indicate server fault or temporary overload/maintenance. Exact status availability differs by operation, as listed above. Responses commonly include `x-amzn-RequestId`; successful and some client-error responses may include `x-amzn-RateLimit-Limit`. [2]

## Facts versus implementation recommendations

**Facts from Amazon's contract and guide:** six operations and the paths/statuses above; document upload and report download use presigned URLs; both URLs expire after five minutes; processing is asynchronous; feed records are retained for at most 90 days; result documents can be GZIP-compressed; the current guide marks XML and flat-file product listing feeds deprecated; rate plans are defaults and `JSON_LISTINGS_FEED` has a distinct `createFeed` plan. [1] [2] [4]

**Recommendations (operational guidance, not API guarantees):** upload and download promptly after receiving URLs; poll with backoff rather than at the maximum rate; persist `feedId` and seller/marketplace context; treat `DONE` as requiring report inspection; preserve and parse each processing report using its feed-specific schema; make retries idempotent at the application layer; refresh an expired presigned URL through the corresponding SP-API operation. Confirm present feed-type requirements and per-account limits before deployment.

## References

[1]: https://developer-docs.amazon.com/sp-api/docs/feeds-api-v2021-06-30-use-case-guide "Feeds API v2021-06-30 use-case guide"
[2]: https://github.com/amzn/selling-partner-api-models/blob/main/models/feeds-api-model/feeds_2021-06-30.json "Amazon SP-API Feeds API OpenAPI model v2021-06-30"
[3]: https://developer-docs.amazon.com/sp-api/docs/listings-feed-type-values "Listings feed type values"
[4]: https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits-in-the-sp-api "Usage plans and rate limits in the SP-API"
