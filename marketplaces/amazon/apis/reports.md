---
title: Amazon Reports API dossier
api: Reports API
version: 2021-06-30
checked: 2026-11-06
evidence_status: Official Amazon API guide and official versioned model opened and reviewed; no sandbox or live account tests performed
---

| Field | Value |
|---|---|
| Scope | Operation-level dossier for Reports API v2021-06-30. |
| Operations | `getReports`, `createReport`, `cancelReport`, `getReport`, `getReportSchedules`, `createReportSchedule`, `cancelReportSchedule`, `getReportSchedule`, `getReportDocument`. |
| Evidence status | Amazon’s official Reports API use-case guide and official versioned model were opened and reviewed on 2026-11-06. No sandbox or live account tests were performed. |
| Request/response media types | The versioned model declares `application/json` for consumes and produces. The two create operations take JSON request bodies. The other operations have no request-body schema. `getReportDocument` returns JSON metadata; report contents are retrieved separately from its presigned URL. |

The Reports API creates and manages asynchronous reports, schedules recurring report requests, and exposes generated report documents for retrieval. This page documents the nine operations in the official v2021-06-30 model. A report job’s processing state and the subsequent document download are distinct stages. Report types, supported options, and report-file layouts are report-specific and can change; use Amazon’s current report-type documentation rather than assuming a universal schema.[1] [2]

## Operation inventory

| Operation ID | HTTP method and path | Purpose | Required / conditional inputs | Success response |
|---|---|---|---|---|
| `getReports` | `GET /reports/2021-06-30/reports` | List reports matching filters. | Initial request requires `reportTypes`; alternatively, continuation requires `nextToken` alone. Other filters/page size may accompany `reportTypes`. | `200` — `GetReportsResponse`; includes `reports`, optionally `nextToken`. |
| `createReport` | `POST /reports/2021-06-30/reports` | Submit an asynchronous report request. | Required JSON body: `reportType`, `marketplaceIds`; other body properties optional. | `202` — `CreateReportResponse` with `reportId`. |
| `cancelReport` | `DELETE /reports/2021-06-30/reports/{reportId}` | Cancel a queued report. | Required path `reportId`; only a report in `IN_QUEUE` can be cancelled. | `200` — no response schema specified. |
| `getReport` | `GET /reports/2021-06-30/reports/{reportId}` | Read one report’s metadata and processing status. | Required path `reportId`. | `200` — `Report`; document ID appears when available. |
| `getReportSchedules` | `GET /reports/2021-06-30/schedules` | List schedules for report types. | Required query `reportTypes` (1–10 values). | `200` — `ReportScheduleList`. |
| `createReportSchedule` | `POST /reports/2021-06-30/schedules` | Create or replace a recurring report schedule. | Required JSON body: `reportType`, `marketplaceIds`, `period`; optional `reportOptions`. | `201` — `CreateReportScheduleResponse` with `reportScheduleId`. |
| `cancelReportSchedule` | `DELETE /reports/2021-06-30/schedules/{reportScheduleId}` | Cancel a recurring schedule. | Required path `reportScheduleId`. | `200` — no response schema specified. |
| `getReportSchedule` | `GET /reports/2021-06-30/schedules/{reportScheduleId}` | Read one schedule. | Required path `reportScheduleId`. | `200` — `ReportSchedule`. |
| `getReportDocument` | `GET /reports/2021-06-30/documents/{reportDocumentId}` | Obtain document retrieval metadata and a temporary URL. | Required path `reportDocumentId`; optional query `enableContentEncodingUrlHeader`. | `200` — `ReportDocument` (`url`, optional `compressionAlgorithm`). |

The official model lists nine operations, exactly those named above.[2]

## `getReports`

**Request:** `GET /reports/2021-06-30/reports`. No request body. All inputs are query parameters.[2]

| Query parameter | Required? | Amazon-documented meaning and constraints |
|---|---|---|
| `reportTypes` | Conditional | Array of 1–10 report-type strings. Required for a new filtered listing. With this parameter, filters `processingStatuses`, `marketplaceIds`, `createdSince`, `createdUntil`, and `pageSize` may also be supplied. Either `reportTypes` or `nextToken` is required. |
| `processingStatuses` | Optional | One or more statuses: `CANCELLED`, `DONE`, `FATAL`, `IN_PROGRESS`, `IN_QUEUE`. |
| `marketplaceIds` | Optional | Array of 1–10 marketplace IDs. A report matching at least one specified marketplace is returned. |
| `pageSize` | Optional | Integer from 1 to 100; default 10. Maximum results in one response. |
| `createdSince` | Optional | ISO 8601 date-time lower bound on report creation. Default is 90 days before now. Amazon states reports are retained for at most 90 days. |
| `createdUntil` | Optional | ISO 8601 date-time upper bound on report creation. Default is now. |
| `nextToken` | Conditional | Opaque token from the prior response. Use it as the only query parameter to fetch the next page; combining it with other parameters fails. |

Success is `200` with `GetReportsResponse`: required `reports` array and optional `nextToken`. If another page exists, continue with that token alone; the model gives no separate token lifetime. The model does not promise a total result ceiling.[2]

## `createReport`

**Request:** `POST /reports/2021-06-30/reports`, with a required JSON body (`CreateReportSpecification`).[2]

| Body property | Required? | Amazon-documented meaning and constraints |
|---|---|---|
| `reportType` | Yes | Report type string; valid values and report-specific behavior are in Amazon’s report-type reference. |
| `marketplaceIds` | Yes | Array of 1–25 marketplace IDs. Unless the report type says otherwise, the resulting document covers all specified marketplaces. |
| `reportOptions` | No | Report-specific key/value options. The API model defines the object as extensible; it does not enumerate universal option fields. |
| `dataStartTime` | No | ISO 8601 start for the report’s data range; defaults to now, must not be in the future, and is not used by every report type. |
| `dataEndTime` | No | ISO 8601 end for the data range; defaults to now, must not be in the future, and is not used by every report type. |

`202 Accepted` returns `CreateReportResponse`, whose required `reportId` identifies the asynchronous job (unique only in combination with seller ID). Acceptance is not completion and does not itself return report contents. Poll `getReport` or find the job with `getReports` to determine its state and, when available, its `reportDocumentId`.[2]

## `cancelReport`

**Request:** `DELETE /reports/2021-06-30/reports/{reportId}`. Required path `reportId`; no body. Amazon documents cancellation only while `processingStatus=IN_QUEUE`. A cancelled report remains visible in subsequent `getReport` and `getReports` results. Success is `200`; the model specifies no response body schema.[2]

## `getReport`

**Request:** `GET /reports/2021-06-30/reports/{reportId}`. Required path `reportId`; no body. Success is `200` with a `Report` object. Required properties are `reportId`, `reportType`, `createdTime`, and `processingStatus`; other properties, including `reportDocumentId`, can be absent. The document ID is available when the report has produced a document; pass that ID to `getReportDocument`, not the report ID.[2]

The model’s processing states mean: `IN_QUEUE` has not started (it may wait for another in-progress report); `IN_PROGRESS` is being processed; `DONE` has completed; `FATAL` was aborted due to a fatal error; and `CANCELLED` was cancelled explicitly before processing or automatically when there is no data to return. Do not equate `202` from `createReport` with any of these terminal states.[1] [2]

## `getReportSchedules`

**Request:** `GET /reports/2021-06-30/schedules`. Required query `reportTypes`: an array of 1–10 report-type values. No request body. Success is `200` with `ReportScheduleList`. The model defines the list as schedules matching the specified report types; it defines no pagination token or page-size parameter for this operation.[2]

## `createReportSchedule`

**Request:** `POST /reports/2021-06-30/schedules`, with a required JSON body (`CreateReportScheduleSpecification`).[2]

| Body property | Required? | Amazon-documented meaning and constraints |
|---|---|---|
| `reportType` | Yes | Report type string. |
| `marketplaceIds` | Yes | Array of 1–25 marketplace IDs. |
| `period` | Yes | One of the model’s ISO-8601 periods: `PT5M`, `PT15M`, `PT30M`, `PT1H`, `PT2H`, `PT4H`, `PT8H`, `PT12H`, `P1D`, `P2D`, `P3D`, `PT84H`, `P7D`, `P14D`, `P15D`, `P18D`, `P30D`, `P1M`. |
| `reportOptions` | No | Report-specific options; valid properties depend on the report type. |

Success is `201` with `CreateReportScheduleResponse` and required `reportScheduleId`. Amazon documents that if a schedule with the same report type and marketplace IDs already exists, it is cancelled and replaced by the new one. The `ReportSchedule` response can include `nextReportCreationTime`; the model does not guarantee that field is always present.[2]

## `cancelReportSchedule`

**Request:** `DELETE /reports/2021-06-30/schedules/{reportScheduleId}`. Required path `reportScheduleId`; no body. Success is `200`, with no response schema specified. The identifier is unique only together with seller ID.[2]

## `getReportSchedule`

**Request:** `GET /reports/2021-06-30/schedules/{reportScheduleId}`. Required path `reportScheduleId`; no body. Success is `200` with a `ReportSchedule`. Required properties are `reportScheduleId`, `reportType`, and `period`; marketplace IDs, options, and next creation time are model properties but not required.[2]

## `getReportDocument`

**Request:** `GET /reports/2021-06-30/documents/{reportDocumentId}`. Required path `reportDocumentId`; optional Boolean query `enableContentEncodingUrlHeader`. No request body. Success is `200` with `ReportDocument`, requiring `reportDocumentId` and a presigned `url`.[2]

The returned URL is the document retrieval mechanism. Amazon documents that it expires after five minutes. If `compressionAlgorithm` is absent, the document can be downloaded directly from the URL. If it is `GZIP`, the downloaded content must be decompressed. When `enableContentEncodingUrlHeader=true` and compression is GZIP, the response URL is configured with `Content-Encoding: gzip` rather than the default `identity`, enabling automatic decompression by supporting HTTP clients. This flag affects the URL’s content-encoding header behavior; it is not itself a decompression instruction. Fetch the URL promptly and do not treat it as a permanent or reusable report identifier.[1] [2]

The report document’s file format and columns depend on report type. Amazon warns report fields/values and document identifier structure may change; robust consumers should tolerate such changes. The reviewed sources do not specify one universal report-file schema, a document download size limit, or a longer URL lifetime.[1]

## Shared authentication, roles, and access constraints

Amazon’s guide lists regions **NA, EU, and FE** and says each operation requires at least one of the following roles: Amazon Fulfillment; Buyer Communication; Buyer Solicitation; Finance and Accounting; Inventory and Order Tracking; Pricing; Product Listing; Professional Services (Restricted); Selling Partner Insights; Direct to Consumer Shipping (Restricted); Tax Invoicing (Restricted); or Tax Remittance (Restricted).[1] The guide shows this same role set for all nine operations. This documents role categories and API regions, not that a specific application has the role, a seller has authorized the application, every report type is available to an account, or any marketplace is enabled. Restricted roles remain restricted. Use the appropriate SP-API regional endpoint and marketplace IDs; the model’s NA host is an example, not a universal endpoint.[2] [3]

The model documents standard SP-API authorization error responses. It does not state a separate Reports-specific account eligibility rule, seller plan threshold, or report-by-report role table in the reviewed sources. Report type availability and its options should be checked in Amazon’s current report-type documentation; do not infer availability merely from a role or region.[1] [4]

## Asynchronous lifecycle, pagination, and errors

A typical one-off flow is: submit `createReport` → retain `reportId` → inspect with `getReport` or `getReports` until a status is known → when a `reportDocumentId` is available, call `getReportDocument` → download from its short-lived presigned URL and decompress if Amazon returns `GZIP`. `DONE` marks processing completion; the model does not guarantee that every report type yields a document. A report can also reach `FATAL` or `CANCELLED`. The guide’s use cases describe polling/report retrieval, but provide no universal completion-time SLA in the reviewed material.[1] [2]

There are two independent retrieval concerns: `getReports` list pagination uses `nextToken` alone on subsequent requests; report generation uses its own `processingStatus` lifecycle. The document URL is a third, short-lived download step. There is no pagination field documented for schedule listings or report-document metadata.[2]

All nine operations document `ErrorList` JSON for applicable errors. `ErrorList` contains an `errors` array; each error requires `code` and `message` and may contain `details`. The versioned model lists these status meanings:[2]

| HTTP status | Amazon-documented response meaning |
|---|---|
| `400` | Request has missing or invalid parameters and cannot be parsed. |
| `401` | Authorization header is malformed or does not contain a valid token. |
| `403` | Access forbidden; possible reasons include access denied, unauthorized, expired token, or invalid signature. |
| `404` | The specified resource does not exist. |
| `415` | The request’s `Content-Type` header is invalid. |
| `429` | Request frequency was greater than allowed. |
| `500` | Unexpected condition prevented the server from fulfilling the request. |
| `503` | Temporary server overload or maintenance. |

A `200`/`201`/`202` is operation-specific success as shown above. The model does not declare `413` for these operations, nor does it define one operation-specific error-code catalog or retry-after guarantee. Amazon’s model contains operation usage-plan defaults and notes that actual applied plans may vary; do not present defaults as a universal account quota. Observe `x-amzn-RateLimit-Limit` when returned and consult Amazon’s live usage-plan guidance.[2] [5]

## Safe workflow notes

**Implementation recommendations—not Amazon guarantees:** Persist the `reportId` and schedule IDs, and distinguish request acceptance from report completion. Poll with bounded intervals and stop polling on `DONE`, `FATAL`, or `CANCELLED`; avoid tight loops. Request only the required report type, marketplace scope, date range, and report-specific options. Use the `getReports` date bounds to limit discovery to the retention window and follow every returned token alone. If cancellation is desired, check that the report is still queued because Amazon documents cancellation only for `IN_QUEUE`.

Treat the presigned URL as a temporary secret: retrieve it only when needed, avoid logging it, and download promptly before expiry. Inspect `compressionAlgorithm` and decompress GZIP exactly as documented. Do not assume stable file columns or identifiers, or silently interpret an omitted optional field as a negative value. Use bounded retries for throttling/transient server failures, preserve Amazon request IDs when available, and do not retry unchanged invalid or forbidden requests. These are client-side safeguards rather than Amazon guarantees.

No sandbox or live account tests were performed. This dossier does not claim that credentials, role assignments, marketplace eligibility, report type access, sample requests, account rate limits, or report contents were tested.

## Official references

[1]: https://developer-docs.amazon.com/sp-api/docs/reports-api-v2021-06-30-use-case-guide "Reports API v2021-06-30 use-case guide"
[2]: https://github.com/amzn/selling-partner-api-models/blob/main/models/reports-api-model/reports_2021-06-30.json "Official versioned Reports API model v2021-06-30"
[3]: https://developer-docs.amazon.com/sp-api/docs/sp-api-endpoints "SP-API endpoints"
[4]: https://developer-docs.amazon.com/sp-api/docs/report-type-values "Report Type Values"
[5]: https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits "Usage Plans and Rate Limits in the Selling Partner API"
