---
title: Amazon Orders API dossier
api: Orders API
version: 2026-01-01
checked: 2026-11-06
evidence_status: Official reference and versioned model opened and reviewed; no sandbox or live account tests performed
---

| Field | Value |
|---|---|
| Scope | Operation-level dossier for Orders API v2026-01-01 only |
| Operations | `searchOrders`, `getOrder` |
| Evidence status | Amazon’s official Orders API reference, interactive versioned reference, migration guide, and official versioned model were opened and reviewed on 2026-11-06. No sandbox or live account tests were performed. |
| Payloads | Both operations are GET requests with no request-body schema. The model declares `application/json` globally for consumes and produces; successful and documented error responses are JSON. |

The Orders API retrieves order information. This page covers only v2026-01-01. Amazon says Orders API v0 is deprecated; its legacy operations are not part of the current operation inventory below. The model describes support for FBM, read-only FBA, and Amazon Fresh orders. Amazon’s overview says orders older than two years are unavailable in most marketplaces, with JP pre-orders excepted; the versioned model/reference states the longer historical window for JP, AU, and SG marketplaces (orders from 2016 onward). Check the specific marketplace’s current reference for the applicable archive boundary.[1] [2] [3]

## Operation inventory

| Operation ID | HTTP method and path | Purpose | Required / conditional inputs | Success response |
|---|---|---|---|---|
| `searchOrders` | `GET /orders/2026-01-01/orders` | Search orders by creation or update time, with optional filters and selected datasets. | Supply exactly one of `createdAfter` or `lastUpdatedAfter`. The corresponding `createdBefore` / `lastUpdatedBefore` is optional but constrained. All other query parameters are optional in the schema. | `200` — `SearchOrdersResponse` (`orders`; optional pagination and time-bound fields). |
| `getOrder` | `GET /orders/2026-01-01/orders/{orderId}` | Retrieve one order by Amazon-defined order ID. | Required path `orderId`; optional `includedData`. | `200` — `GetOrderResponse` (`order`). |

The exact operation IDs, methods, paths, parameters, response schema names, and status responses match the official versioned model. Its current `paths` section contains these two operations; the v0 operations listed on the overview are deprecated and are intentionally excluded.[1] [2] [3]

## `searchOrders`

**Request:** `GET /orders/2026-01-01/orders`. The operation has no request body; its inputs are query parameters. The general model media type is `application/json`, but neither GET operation defines a body parameter. A successful response is JSON `SearchOrdersResponse`.[1] [2]

| Query parameter | Required? | Documented meaning and constraints |
|---|---|---|
| `createdAfter` | Conditional | Orders created at or after an ISO 8601 date-time. Provide exactly one of this or `lastUpdatedAfter`. If supplied, do not supply either `lastUpdatedAfter` or `lastUpdatedBefore`. |
| `createdBefore` | Optional, conditional | Orders created at or before this ISO 8601 time. Allowed only with `createdAfter`; must be equal to or later than `createdAfter` and at least two minutes before request time. |
| `lastUpdatedAfter` | Conditional | Orders updated at or after this ISO 8601 date-time. An update includes changes made by Amazon or seller, including order-status changes. Provide exactly one of this or `createdAfter`. If supplied, do not supply either `createdAfter` or `createdBefore`. |
| `lastUpdatedBefore` | Optional, conditional | Orders updated at or before this ISO 8601 time. Allowed only with `lastUpdatedAfter`; must be equal to or later than `lastUpdatedAfter` and at least two minutes before request time. |
| `fulfillmentStatuses` | No | Array of statuses: `PENDING_AVAILABILITY`, `PENDING`, `UNSHIPPED`, `PARTIALLY_SHIPPED`, `SHIPPED`, `CANCELLED`, `UNFULFILLABLE`. |
| `marketplaceIds` | No in schema | Marketplace filter; array maximum 50. The model does not mark it required. Use IDs valid for the authorized seller and endpoint region. |
| `fulfilledBy` | No | Array values `MERCHANT` and/or `AMAZON`. |
| `maxResultsPerPage` | No | Integer 1–100; default 100. |
| `paginationToken` | No | Opaque token copied from response pagination `nextToken` for the next page. Other search parameters must match the request that produced the token, except `maxResultsPerPage` and `includedData` may change. Token expires after 24 hours. |
| `includedData` | No | Array of datasets to include: `BUYER`, `RECIPIENT`, `PROCEEDS`, `EXPENSE`, `PROMOTION`, `CANCELLATION`, `FULFILLMENT`, `PACKAGES`, `TAX`, `PAYMENT`, `FULFILLMENT_ORDERS`. |

The successful response requires `orders`, an array of `Order`. It may also contain `pagination`, `lastUpdatedBefore`, and `createdBefore`. If another page exists, `pagination.nextToken` supplies the next request’s `paginationToken`; when there are no more pages, `pagination` is absent. The page token expires after 24 hours. `maxResultsPerPage` bounds each page to 100; Amazon does not state a total result ceiling in the reviewed operation model. Orders include core identifiers, timestamps, sales channel, and order items; additional top-level or item data is selected with `includedData`. Model properties that are not required may be omitted, including because datasets were not requested or are not available for a given order/program.[1] [2]

`includedData` consolidates data that required separate v0 calls. In this version the documented values select buyer, recipient/delivery preferences, proceeds, item expenses, promotions, cancellations, fulfillment details, FBM packages, tax, payment, and fulfillment orders. `FULFILLMENT_ORDERS` is for associated fulfillment-order information; the model notes this is available only for Easy Ship and Seller Flex. `PACKAGES` concerns merchant-fulfilled packages. Do not infer that every optional field is populated for every order.[2] [3]

## `getOrder`

**Request:** `GET /orders/2026-01-01/orders/{orderId}`. Required path parameter `orderId` is an Amazon-defined order identifier. Optional query parameter `includedData` accepts the same dataset values listed for `searchOrders`. There is no request body. On success, JSON `GetOrderResponse` contains required property `order`, an `Order` object. The Order model requires `orderId`, `createdTime`, `lastUpdatedTime`, `salesChannel`, and `orderItems`; most other properties are optional and may be absent.[1] [2]

This operation is the targeted detail lookup. Request only additional datasets the caller needs. The migration guide maps v0 `GetOrderBuyerInfo` to `includedData=BUYER`, `GetOrderAddress` to `RECIPIENT`, and legacy order/item detail calls to the consolidated order response; v2026-01-01 does not require an RDT for PII, but the appropriate role is still required.[3] Optional datasets and fields are not guarantees of presence.

## Shared authentication, roles, and access constraints

The official Orders API overview lists the same required-role choices for both v2026-01-01 operations, with **at least one** of the following roles: Amazon Fulfillment, Buyer Communication, Buyer Solicitation, Direct to Consumer Shipping (Restricted), Finance and Accounting, Inventory and Order Tracking, Pricing, Product Listing, Professional Services (Restricted), Selling Partner Insights, Tax Invoicing (Restricted), or Tax Remittance (Restricted). It lists regions NA, EU, and FE for both operations.[1] These are documented role/region categories, not evidence that a particular application has approval, a seller has authorized that app, a marketplace is enabled, or returned data is visible. Restricted roles remain subject to Amazon’s role/access approval rules.

Amazon’s migration guide says v2026-01-01 uses role-based permission for PII and does not require Restricted Data Token generation. This does not remove the need for valid SP-API authorization, applicable roles, seller consent, required request headers, or regional endpoint selection.[3] Amazon’s current connection guide lists `host`, `x-amz-access-token`, `x-amz-date`, and `user-agent` as request headers and its example does not include SigV4 signing.[7] The model’s sample host is the NA endpoint; it is not a universal host. Use Amazon’s endpoint/marketplace mappings for the target marketplace rather than deriving region from the marketplace ID.[4] [5]

## Pagination, asynchronous behavior, and errors

Both operations are synchronous request/response GETs. The model defines no asynchronous job, polling, callback, or notification lifecycle. Pagination applies to `searchOrders` only, via `pagination.nextToken` → `paginationToken`; retain the same search criteria when continuing, with the documented exceptions for page size and included datasets. Tokens expire after 24 hours.[2]

Both operations document the same error statuses and JSON `ErrorList` response schema. An `ErrorList` requires an `errors` array; each error requires `code` and `message` and may include `details`.[2]

| HTTP status | Amazon-documented response meaning |
|---|---|
| `400` | Request has missing or invalid parameters and cannot be parsed. |
| `403` | Access forbidden; possible reasons include Access Denied, Unauthorized, Expired Token, or Invalid Signature. |
| `404` | The specified resource does not exist. |
| `413` | Request size exceeded the maximum accepted size. |
| `415` | Request payload is in an unsupported format. |
| `429` | Request frequency was greater than allowed. |
| `500` | Unexpected condition prevented the server from fulfilling the request. |
| `503` | Temporary server overload or maintenance. |

No operation-specific error code catalog or retry-after guarantee is stated in the reviewed model. Do not invent one. The model describes the response meanings above; recommendations below are implementation guidance, not additional Amazon semantics.[2]

## Safe workflow notes

**Implementation recommendations—not Amazon guarantees:** For incremental synchronization, choose one time axis (`createdAfter` for new-order discovery or `lastUpdatedAfter` for change discovery), persist a checkpoint, and query overlapping windows to reduce the chance of missing boundary updates. Deduplicate/upsert by order ID and retain `lastUpdatedTime`; the model does not promise snapshot isolation or exactly-once delivery. Follow every returned token promptly and preserve matching filters. Request only needed `includedData` to reduce payload and PII exposure. Treat absent optional data as unknown/not returned rather than as a negative value. Handle throttling and transient server errors with bounded retry/backoff and record Amazon request identifiers when available; do not retry unchanged invalid or forbidden requests. These practices are client-side safeguards, not Amazon guarantees.

For historical backfills, account for marketplace-specific archival windows. The Orders overview notes orders more than two years old do not appear except JP pre-orders; the versioned reference/model gives JP, AU, and SG historical support from 2016 onward. This is a retention/access boundary, not a pagination setting.[1] [2]

No sandbox or live account tests were performed. This dossier makes no claim that credentials, role assignments, marketplace eligibility, example calls, or account-specific rate limits were tested.

## Python `httpx` examples

These examples accept an access token as a function argument; they do not exchange credentials or embed real IDs or tokens. Set `endpoint` to the SP-API regional host for the target marketplace. Per Amazon’s current connection guide, include `x-amz-access-token`, `x-amz-date`, and `user-agent`; the HTTP client supplies `host`. The guide’s request example does not include SigV4 signing. Confirm current authentication instructions when deploying.[7] Only request datasets needed by the caller: omit `includedData` by default, and avoid `BUYER` or `RECIPIENT` unless required.

```python
import random
import time
from datetime import datetime, timezone
from urllib.parse import quote

import httpx


RETRYABLE_STATUS = {429, 500, 503}
MAX_ATTEMPTS = 5


def get_json(client: httpx.Client, url: str, *, access_token: str, params=None):
    """GET JSON with bounded retries for throttling/transient failures only."""
    for attempt in range(MAX_ATTEMPTS):
        headers = {
            "x-amz-access-token": access_token,
            "x-amz-date": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
            "user-agent": "MarketplaceIntegrationPlaybook/1.0 (Language=Python)",
            "accept": "application/json",
        }
        try:
            response = client.get(url, headers=headers, params=params)
        except httpx.TransportError:
            if attempt == MAX_ATTEMPTS - 1:
                raise
        else:
            # Capture diagnostics before status handling, including for errors.
            diagnostics = {
                key: response.headers.get(key)
                for key in ("x-amzn-RequestId", "x-amz-apigw-id",
                            "x-amzn-RateLimit-Limit", "retry-after")
            }
            if response.status_code not in RETRYABLE_STATUS:
                response.raise_for_status()  # Invalid/auth 4xx fail without retry.
                return response.json(), diagnostics
            if attempt == MAX_ATTEMPTS - 1:
                response.raise_for_status()  # Preserve final status/response for diagnosis.
        if attempt < MAX_ATTEMPTS - 1:
            # Exponential delay capped at 30s with full jitter. Do not assume
            # Retry-After is guaranteed; the documented API model gives no guarantee.
            time.sleep(random.uniform(0, min(30.0, 0.5 * (2 ** attempt))))
    raise RuntimeError("unreachable")


def search_orders(client: httpx.Client, endpoint: str, access_token: str,
                  marketplace_id: str, last_updated_after: str):
    url = f"{endpoint.rstrip('/')}/orders/2026-01-01/orders"
    # Keep this base filter set unchanged on every page. No optional datasets
    # are requested, minimizing returned personal data.
    base_params = [
        ("lastUpdatedAfter", last_updated_after),
        ("marketplaceIds", marketplace_id),
        ("maxResultsPerPage", "100"),
    ]
    token = None
    while True:
        params = list(base_params)
        if token:
            params.append(("paginationToken", token))
        page, diagnostics = get_json(
            client, url, access_token=access_token, params=params
        )
        # Persist/log diagnostics safely; never log access_token or PII payloads.
        yield page, diagnostics
        token = (page.get("pagination") or {}).get("nextToken")
        if not token:
            break


def get_order(client: httpx.Client, endpoint: str, access_token: str,
              order_id: str):
    url = f"{endpoint.rstrip('/')}/orders/2026-01-01/orders/{quote(order_id, safe='')}"
    return get_json(client, url, access_token=access_token)
```

The `search_orders` example uses exactly one time-bound filter and retains the same filters while passing each `nextToken` as `paginationToken`. Adjust the time axis and filters for the use case. The retry policy is deliberately limited to `429`, `500`, `503`, and network transport failures, with a finite attempt count and exponential backoff plus jitter. Other HTTP errors, including invalid-parameter and authentication/authorization `4xx` responses, fail immediately for caller diagnosis; do not retry them unchanged. Capture and retain request IDs and rate-limit headers from both success and error responses, while redacting tokens and minimizing logged order data.[1] [2] [6]

## Official references

[1]: https://developer-docs.amazon/sp-api/docs/orders-api "Orders API overview and role tables"
[2]: https://github.com/amzn/selling-partner-api-models/blob/main/models/orders-api-model/orders_2026-01-01.json "Official versioned Orders API model v2026-01-01"
[3]: https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide "Orders API migration guide"
[4]: https://developer-docs.amazon/sp-api/docs/sp-api-endpoints "SP-API endpoints"
[5]: https://developer-docs.amazon/sp-api/docs/marketplace-ids "Marketplace IDs"
[6]: https://developer-docs.amazon.com/sp-api/reference/searchorders "Search Orders operation reference"
[7]: https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api "Amazon's current SP-API connection and request-header guide"
