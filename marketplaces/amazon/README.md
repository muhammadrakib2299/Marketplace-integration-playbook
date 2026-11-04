# Amazon Selling Partner API (SP-API)

| Field | Value |
|---|---|
| Documentation status | documented |
| Integration claim | documentation only; no connection is claimed or tested by this repository |
| Channel type | marketplace |
| Regions / seller programs | North America, Europe, and Far East endpoint groups; this guide focuses on seller-side order and listing flows |
| API surfaces | Catalog Items API v2022-04-01; Orders API v2026-01-01; Listings Items API v2021-08-01; Product Type Definitions API v2020-09-01; Notifications API v1 |
| Access model | mixed (private/self-authorized and public/OAuth-based paths; role and app approval requirements apply) |
| Evidence | official documentation reviewed; not tested |
| Last verified | 2026-11-04 |
| Maintainer | repository contributors |

This is an independent summary of public Amazon developer documentation. It is not an Amazon guide or endorsement. Amazon product names belong to Amazon. It contains no Amazon credentials or seller data.

## Scope

This folder provides a source-linked starting point for developers planning seller-side integrations with Amazon through SP-API. It covers onboarding, authentication concepts, regional endpoints, order synchronization, merchant-fulfilled listing quantity updates, and testing considerations. Vendor applications, FBA inbound planning, payments, advertising, Amazon Business-specific workflows, and other APIs need separate, scoped guides.

The guide does not establish that a public API application will be approved, that every role is available to every developer, or that any integration is implemented in WMS360. Review Amazon's [developer onboarding guide](https://developer-docs.amazon/sp-api/docs/onboarding-overview) and [roles](https://developer-docs.amazon/sp-api/docs/roles-in-the-selling-partner-api) for the specific use case and account.

## Important version warning

Amazon's current [Orders API guide](https://developer-docs.amazon/sp-api/docs/orders-api) marks Orders API v0 as deprecated. Amazon's [deprecation schedule](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations) lists removal of the v0 order operations on **March 27, 2027**. New work in this guide targets Orders API **v2026-01-01**. If maintaining a v0 integration, plan and verify migration against the [official migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide) and the live schedule before the removal date.

## Access and authentication at a glance

Public applications use seller authorization through Login with Amazon (LWA) OAuth, while private applications use Amazon's self-authorization flow. Amazon requires app registration and authorization; public developer/Appstore publication and API roles can require review. The exact prerequisites depend on app type, seller/vendor use, API, and requested data. See [authorizing applications](https://developer-docs.amazon/sp-api/docs/authorizing-selling-partner-api-applications).

For authorized calls, the [connection guide](https://developer-docs.amazon/sp-api/docs/connecting-to-the-selling-partner-api) describes exchanging a refresh token for an LWA access token and sending the access token in `x-amz-access-token`. It states that an access token expires after one hour. SP-API calls also require the appropriate endpoint and a `user-agent`; use Amazon's current request-construction guidance rather than copying credentials or sample tokens into code or docs.

## Regional routing

Choose the host for the target Amazon store and provide its `marketplaceId`; do not assume a hostname or marketplace identifier from another country. Amazon currently documents North America, Europe, and Far East endpoint groups in its [SP-API endpoints page](https://developer-docs.amazon/sp-api/docs/sp-api-endpoints), and country/store identifiers in [Store Identifiers](https://developer-docs.amazon/sp-api/docs/store-identifiers). Confirm the supported region and account participation for each API operation before use.

## Guides and workflows

- [Initial API catalog and cross-API map](apis/) — six scoped API families; provider-wide counts remain separate from this curated scope.
- [Catalog Items API dossier](apis/catalog-items.md) — both v2022-04-01 operations, constraints, pagination, limits, and Python/NestJS examples.
- [SP-API development guide](guides/development-guide.md)
- [Order synchronization workflow](workflows/order-lifecycle.md)
- [Merchant-fulfilled listing and inventory workflow](workflows/inventory-and-listings.md)

## Core capability map

| Need | Starting API | Notes |
|---|---|---|
| Match or enrich catalog products | Catalog Items API v2022-04-01 | Read-only catalog lookup by identifiers, keywords, or ASIN; see the [two-operation dossier](apis/catalog-items.md). |
| Search and retrieve orders | Orders API v2026-01-01 | `searchOrders` supports created/updated filters and pagination. Use `includedData` only for required datasets. |
| Read and update a seller listing | Listings Items API v2021-08-01 | Individual listing operations; review issue/status responses and product-type requirements. |
| Determine listing attributes | Product Type Definitions API v2020-09-01 | Product type schemas vary by store and account type. |
| Receive event notifications | Notifications API v1 | Use notifications where supported, with a backup/reconciliation mechanism. |
| Bulk listing submissions | Feeds API with `JSON_LISTINGS_FEED` | Consider for bulk workflows; check current feed schema and processing notifications. |

## Access to order data and privacy

Amazon's new Orders API migration guide says v2026-01-01 uses role-based permissions for PII and does not require RDTs for that version's order PII. This does not make buyer or recipient data unrestricted: request only necessary `includedData`, verify the exact role and current Amazon policy, and protect/retain data according to the applicable requirements. Other APIs or older versions can have different Restricted Data Token rules.

## Testing and evidence

Amazon provides static and dynamic hosted SP-API sandboxes, with operation-specific support documented on the [sandbox page](https://developer-docs.amazon/sp-api/docs/sp-api-sandbox). Static responses are mocks; dynamic behavior is not available for every operation. Sandbox calls are for functionality testing, not production capacity testing. This repository has not run calls against an Amazon sandbox or seller account, so no behavior here is labeled **Tested**.

## Official sources

- [SP-API documentation welcome page](https://developer-docs.amazon/sp-api/docs/welcome)
- [Developer onboarding](https://developer-docs.amazon/sp-api/docs/onboarding-overview)
- [Authorization methods](https://developer-docs.amazon/sp-api/docs/authorizing-selling-partner-api-applications)
- [Connect to SP-API](https://developer-docs.amazon/sp-api/docs/connecting-to-the-selling-partner-api)
- [Orders API overview and current version](https://developer-docs.amazon/sp-api/docs/orders-api)
- [Orders API v2026-01-01 migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide)
- [searchOrders reference](https://developer-docs.amazon/sp-api/reference/searchorders)
- [SP-API deprecation schedule](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations)
- [Listings Items API](https://developer-docs.amazon/sp-api/docs/listings-items-api)
- [Manage product listings guide](https://developer-docs.amazon/sp-api/docs/manage-product-listings-guide)
- [Product Type Definitions API](https://developer-docs.amazon/sp-api/docs/product-type-definitions-api)
- [Notifications API guide](https://developer-docs.amazon/sp-api/docs/notifications-api-v1-use-case-guide)
- [Usage plans and rate limits](https://developer-docs.amazon/sp-api/docs/usage-plans-and-rate-limits)
- [SP-API endpoints](https://developer-docs.amazon/sp-api/docs/sp-api-endpoints)
- [Store identifiers](https://developer-docs.amazon/sp-api/docs/store-identifiers)
- [Sandbox](https://developer-docs.amazon/sp-api/docs/sp-api-sandbox)
- [Official SP-API models repository](https://github.com/amzn/selling-partner-api-models)

These sources were reviewed on 2026-11-05. API versions, access policies, role requirements, rate plans, and removal dates can change; verify them before implementing or publishing an updated guide.
