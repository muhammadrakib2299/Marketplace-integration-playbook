---
title: Amazon Finances API dossier
api: Finances API
version: v0
checked: 2026-11-06
evidence_status: Official Finances API overview/reference and official v0 OpenAPI model opened and reviewed; no sandbox or live account tests performed
---

| Field | Value |
|---|---|
| Scope | Operation-level dossier for Amazon Selling Partner API Finances **v0** only. It does not cover the separate v2024-06-19 Finances API, Invoices, or Transfers APIs. |
| Operations | `listFinancialEventGroups`, `listFinancialEventsByGroupId`, `listFinancialEventsByOrderId`, `listFinancialEvents`. |
| Evidence status | Amazon's official Finances API overview/reference and the official `financesV0.json` model in the SP-API models repository were opened and reviewed on 2026-11-06. No sandbox or live account tests were performed. |
| Request/response media types | Model declares `application/json`; all four operations are GET requests without request bodies. Success and modeled errors use the operation response wrapper. |

The v0 API provides financial **event groups** and **financial events**. An event group is a payout/accounting grouping with group-level processing and transfer metadata; it is not itself the event ledger. Financial events are transaction/event records returned in category-specific arrays. Amazon says event data can be retrieved without waiting for a statement period to close.[1] [2]

## Operation inventory

| Operation ID | HTTP method and path | Purpose | Inputs | Success response |
|---|---|---|---|---|
| `listFinancialEventGroups` | `GET /finances/v0/financialEventGroups` | Find financial event groups by their open/start time. | Optional query: `MaxResultsPerPage`, `FinancialEventGroupStartedAfter`, `FinancialEventGroupStartedBefore`, `NextToken`. | `200` — `ListFinancialEventGroupsResponse`; `payload.FinancialEventGroupList`, optional `payload.NextToken`. |
| `listFinancialEventsByGroupId` | `GET /finances/v0/financialEventGroups/{eventGroupId}/financialEvents` | Retrieve events associated with one financial event group. | Required path `eventGroupId`; optional `MaxResultsPerPage`, `PostedAfter`, `PostedBefore`, `NextToken`. | `200` — `ListFinancialEventsResponse`; `payload.FinancialEvents`, optional `payload.NextToken`. |
| `listFinancialEventsByOrderId` | `GET /finances/v0/orders/{orderId}/financialEvents` | Retrieve events associated with one Amazon order. | Required path `orderId`; optional `MaxResultsPerPage`, `NextToken`. | `200` — `ListFinancialEventsResponse`; `payload.FinancialEvents`, optional `payload.NextToken`. |
| `listFinancialEvents` | `GET /finances/v0/financialEvents` | Retrieve events by posting-date range. | Optional query: `MaxResultsPerPage`, `PostedAfter`, `PostedBefore`, `NextToken`. | `200` — `ListFinancialEventsResponse`; `payload.FinancialEvents`, optional `payload.NextToken`. |

The four rows are the complete `paths` inventory in the reviewed v0 model. Every operation is synchronous; the model declares no request body, asynchronous job, polling state, callback, or notification lifecycle.[2] [5]

## Shared response schemas and financial data

`ListFinancialEventGroupsResponse` contains optional `payload` and `errors`. Its payload has optional `NextToken` and `FinancialEventGroupList`. Each `FinancialEventGroup` can contain `FinancialEventGroupId`, `ProcessingStatus`, `FundTransferStatus`, `OriginalTotal`, `ConvertedTotal`, `FundTransferDate`, `TraceId`, `AccountTail`, `BeginningBalance`, `FinancialEventGroupStart`, and `FinancialEventGroupEnd`. These model properties are not marked required; do not assume every property will be present.[2]

`ListFinancialEventsResponse` similarly contains optional `payload` and `errors`. Its payload contains optional `NextToken` and `FinancialEvents`. The `FinancialEvents` object exposes event-type lists: `ShipmentEventList`, `ShipmentSettleEventList`, `RefundEventList`, `GuaranteeClaimEventList`, `EBTRefundReimbursementOnlyEventList`, `ChargebackEventList`, `PayWithAmazonEventList`, `ServiceProviderCreditEventList`, `RetrochargeEventList`, `RentalTransactionEventList`, `ProductAdsPaymentEventList`, `ServiceFeeEventList`, `SellerDealPaymentEventList`, `DebtRecoveryEventList`, `LoanServicingEventList`, `AdjustmentEventList`, `SAFETReimbursementEventList`, `SellerReviewEnrollmentPaymentEventList`, `FBALiquidationEventList`, `CouponPaymentEventList`, `ImagingServicesFeeEventList`, `NetworkComminglingTransactionEventList`, `AffordabilityExpenseEventList`, `AffordabilityExpenseReversalEventList`, `RemovalShipmentEventList`, `RemovalShipmentAdjustmentEventList`, `TrialShipmentEventList`, `TDSReimbursementEventList`, `AdhocDisbursementEventList`, `TaxWithholdingEventList`, `ChargeRefundEventList`, `FailedAdhocDisbursementEventList`, `ValueAddedServiceChargeEventList`, and `CapacityReservationBillingEventList`. These event-grouping arrays are financial-event categories; they are distinct from the `FinancialEventGroupList` returned by the group-list operation. Category arrays are optional and not all apply to each response.[2]

The category-specific event definitions contain transaction-specific amounts, identifiers, dates, and, for some event types, order/item or seller references. The schemas are not one uniform record: use the precise sub-schema for each event list and preserve category identity when normalizing. Monetary amounts use the model's `Currency` structure (`CurrencyCode`, `CurrencyAmount`). The model does not mark the response wrapper's `payload` or `errors` as universally required; handle absent optional data without interpreting absence as zero or as proof that an event did not occur.[2]

## `listFinancialEventGroups`

**Request:** `GET /finances/v0/financialEventGroups`. No request body. All inputs are query parameters.[2]

| Query parameter | Required? | Amazon-documented meaning and constraints |
|---|---|---|
| `MaxResultsPerPage` | No | Integer 1–100; model default 10. Maximum results per page. If result exceeds the maximum transaction count or 10 MB, the response is `InvalidInput`. |
| `FinancialEventGroupStartedAfter` | No | ISO 8601 date-time lower bound on when groups opened; inclusive (“after or at”). Must be more than two minutes before request time. |
| `FinancialEventGroupStartedBefore` | No | ISO 8601 date-time upper bound; exclusive (“before, but not at”). Must be later than `StartedAfter` and more than two minutes before request time. If the two bounds are more than 180 days apart, no groups are returned. |
| `NextToken` | No | Opaque continuation token. Continue with the same arguments used for the preceding request, including any date bounds and page size. Pages can be empty; continue until token is null/absent. |

The successful response is `200` with `ListFinancialEventGroupsResponse`. The model provides no guarantee that a non-empty page is returned whenever a next token exists. Its endpoint description also warns that orders from the last 48 hours might not be included in financial events; do not treat the most recent two days of event data as complete.[2]

## `listFinancialEventsByGroupId`

**Request:** `GET /finances/v0/financialEventGroups/{eventGroupId}/financialEvents`. Required path `eventGroupId` identifies the group. No request body.[2]

| Parameter | Required? | Amazon-documented meaning and constraints |
|---|---|---|
| `eventGroupId` | Yes, path | Identifier of the financial event group whose events are requested. |
| `MaxResultsPerPage` | No | Integer 1–100; model default 100. A page that exceeds maximum transactions or 10 MB can return `InvalidInput`. |
| `PostedAfter` | No | ISO 8601 date-time lower bound on event posting; inclusive. Must be more than two minutes before request time. |
| `PostedBefore` | Conditional | ISO 8601 date-time upper bound; exclusive. Requires `PostedAfter`, must be later than it and more than two minutes before request time. A range wider than 180 days returns an empty response. If omitted, model describes a default ending two minutes before request time. |
| `NextToken` | No | Opaque token; include the same arguments as the request that returned it. Empty pages are possible; continue until token is null/absent. |

The endpoint returns `ListFinancialEventsResponse` on `200`. Amazon documents that requests can retrieve a group's data only for the past two years; a request spanning more than two years produces an empty response. Deferred events do not appear in this operation's response until released. Events from the last 48 hours might not be included.[2]

## `listFinancialEventsByOrderId`

**Request:** `GET /finances/v0/orders/{orderId}/financialEvents`. Required path `orderId` is an Amazon-defined order identifier in `3-7-7` format. No request body.[2]

| Parameter | Required? | Amazon-documented meaning and constraints |
|---|---|---|
| `orderId` | Yes, path | Amazon-defined order ID in the documented `3-7-7` format. |
| `MaxResultsPerPage` | No | Integer 1–100; model default 100. A page exceeding maximum transactions or 10 MB can return `InvalidInput`. |
| `NextToken` | No | Opaque continuation token; include the same arguments as the originating request. Empty pages can occur; continue until token is null/absent. |

The successful response is `200` with `ListFinancialEventsResponse`. This operation has no posted-date filters in its model contract. The operation description warns that events from the last 48 hours might not be included. The operation description does not repeat the two-year limitation stated for group lookup; do not silently attribute that group-specific text to this order lookup.[2]

## `listFinancialEvents`

**Request:** `GET /finances/v0/financialEvents`. No request body. Date filters refer to posting time, not group-open time.[2]

| Query parameter | Required? | Amazon-documented meaning and constraints |
|---|---|---|
| `MaxResultsPerPage` | No | Integer 1–100; model default 100. A page exceeding maximum transactions or 10 MB can return `InvalidInput`. |
| `PostedAfter` | No | ISO 8601 date-time lower bound, inclusive. Must be more than two minutes before request time. |
| `PostedBefore` | Conditional | ISO 8601 date-time upper bound, exclusive. Requires `PostedAfter`; must be later than it and more than two minutes before request time. A range wider than 180 days returns an empty response. If omitted, default is two minutes before request time. |
| `NextToken` | No | Opaque continuation token; include the same arguments as the originating request. Empty pages can occur; continue until token is null/absent. |

The successful response is `200` with `ListFinancialEventsResponse`. Amazon's operation description warns that orders from the last 48 hours might not be included in financial events. Do not confuse this posting-time filter with event-group start-time filters: the group-list operation filters when a group opened; the financial-event operations filter when an event was posted.[2]

## Shared roles, regions, and access

Amazon's Finances API overview lists regions **NA, EU, and FE** for all four v0 operations, with the role qualifications shown below. Each operation requires at least one listed role.[1]

| Operation | Officially listed eligible role(s) |
|---|---|
| `listFinancialEventGroups` | Finance and Accounting; Account Information Service Provider (EU only). |
| `listFinancialEventsByGroupId` | Finance and Accounting; Account Information Service Provider (EU only). |
| `listFinancialEventsByOrderId` | Finance and Accounting. |
| `listFinancialEvents` | Finance and Accounting; Amazon Fulfillment (NA, FE only); Account Information Service Provider (EU only). |

Role/region categories do not establish that a specific application has been approved for a role, that a seller authorized it, or that a marketplace/account has access. Use the SP-API endpoint appropriate to the seller's marketplace/region; the model's sample host `sellingpartnerapi-na.amazon.com` is not a universal endpoint.[4] The model declares `application/json`; no async authorization token or request-body contract applies to these GET operations.[1] [2] [3]

## Usage limits, pagination, and errors

The official model gives the same **default usage plan** for each of the four operations: rate **0.5 requests/second**, burst **30**. Amazon states the applied usage plan can be higher for sellers whose needs require it. `x-amzn-RateLimit-Limit` reports the applied rate when available. Treat the values as model defaults, not a guarantee of the account's actual quota; inspect response headers when present and consult Amazon's usage-plan guidance.[2] [3]

All operations paginate with response `payload.NextToken` and request `NextToken`. Pass the token together with the same original arguments. Amazon explicitly warns that empty pages may occur, so do not stop merely because a page contains no events/groups if a continuation token remains. No token lifetime is stated in the reviewed model. There is no asynchronous process or polling cycle.[2]

The model documents the following status responses on each operation. Error bodies reference the operation's response wrapper; the `Error` schema requires `code` and `message` and may include `details`. Error examples are not a complete operation-specific code catalog.[2]

| HTTP status | Model response description |
|---|---|
| `400` | Missing/invalid parameters or request cannot be parsed; the model's examples identify `InvalidInput` for invalid date-range/page-size cases. |
| `403` | Forbidden; possible reasons include access denied, unauthorized, expired token, or invalid signature. |
| `404` | Specified resource does not exist. |
| `429` | Request frequency exceeded allowed rate. |
| `500` | Unexpected condition prevented server from fulfilling request. |
| `503` | Temporary server overload or maintenance. |

The v0 model does not list `401`, `413`, or `415` response codes for these operations, nor does it define a retry-after guarantee. Do not infer those as documented Finances-specific response contracts from another SP-API model.[2]

## Data windows and minimization

**Amazon-documented facts:** group-start windows over 180 days yield no groups; posted-event windows over 180 days yield an empty response; group event retrieval is limited to the past two years; events from the last 48 hours might be absent; deferred group events are not returned until released; and an oversized response/page can return `InvalidInput` when it exceeds transaction or 10 MB limits.[2] These are distinct boundaries and must not be collapsed into one universal “financial history” window.

**Implementation recommendations—not Amazon guarantees:** For incremental reconciliation, use a posted-time lower bound and a conservative lag/overlap, persist checkpoints, deduplicate/upsert using Amazon event/order/group identifiers appropriate to each event type, and revisit recent windows because of the 48-hour completeness warning and deferred-event behavior. Split backfills into ranges no wider than 180 days, and keep group-start scans separate from event-posted scans. Follow every token and retain the request filters used for its page. Request a specific group or order when that is the actual need instead of broad date-range retrieval. Parse only the category lists and fields needed; avoid retaining unrelated financial or account fields such as `AccountTail` unless required. Treat optional/missing fields as unavailable, not as zero, false, or proof of no activity. Use bounded backoff for throttling/transient failures and avoid logging sensitive full payloads or identifiers unnecessarily. These are client-side safeguards, not Amazon guarantees.

No sandbox or live account tests were performed. This dossier does not establish that credentials, roles, marketplaces, sample requests, response examples, or account-specific usage plans were tested.

## References

[1]: https://developer-docs.amazon.com/sp-api/docs/finances-api "Finances API overview and role table"
[2]: https://github.com/amzn/selling-partner-api-models/blob/main/models/finances-api-model/financesV0.json "Official Finances API v0 OpenAPI model"
[3]: https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits "Usage plans and rate limits"
[4]: https://developer-docs.amazon.com/sp-api/docs/sp-api-endpoints "SP-API endpoints"
[5]: https://developer-docs.amazon.com/sp-api/docs/finances-api-reference "Finances API reference"
