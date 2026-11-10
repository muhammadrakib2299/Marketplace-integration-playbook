# Amazon Selling Partner API (SP-API)

| Field | Value |
|---|---|
| Documentation status | Source-linked implementation guidance; no integration claim |
| Scope | Seller account authorization, listing migration, catalog enrichment, seller-fulfilled listings, order-sync entry point |
| Evidence | Official Amazon documentation reviewed; no sandbox or production tests performed |
| Last checked | 2026-11-06 |

This independent guide helps developers plan a seller-side integration with Amazon. It does not claim that this repository connects to Amazon or that any example has been production-tested.

## Developer journey

### 1. Select the correct scope

Decide whether the app is private or public, which seller or vendor workflows it supports, which roles it needs, and whether the first release migrates listings, reads orders, updates seller-fulfilled quantity, or handles FBA inventory. Use the [seller-versus-vendor comparison](apis/seller-vendor-comparison.md) and [API directory](apis/index.md) to see how the API surfaces relate and what still needs operation-level review.

### 2. Connect the seller account

Follow the step-by-step [seller authorization guide](guides/seller-onboarding.md). It covers developer registration, seller consent, OAuth state validation, refresh-token handling, regional endpoints, a verified “connected” state, and Python/NestJS backend boundaries.

### 3. Import existing listings before enabling sync

Use the [active listing migration workflow](workflows/active-listing-migration.md) to collect a seller/marketplace baseline, preserve SKU and state, enrich catalog facts without confusing them with seller attributes, validate product types, preview writes, and reconcile results.

### 4. Add ongoing order or inventory flows

The [development guide](guides/development-guide.md) covers version selection, routing, security, rate-limit handling, and testing boundaries. Use the [order synchronization workflow](workflows/order-lifecycle.md) for order data, and the [seller-fulfilled listing/inventory workflow](workflows/inventory-and-listings.md) for quantity updates. FBA inventory is a separate API/data flow.

## Scope and evidence boundaries

Amazon's official SP-API Models directory listed **57 API/model-family entries on 2026-11-06**. That includes seller-only, vendor-only, shared, and special/region-specific entries; it is not an operation count or a list of APIs every seller needs. See the [API directory and count method](apis/index.md).

The comparison page classifies all 57 directory entries by seller, vendor, shared, or program-specific use-case evidence. The first operation-level batch covers [Catalog Items](apis/catalog-items-reference.md), [Listings Items](apis/listings-items.md), [Orders](apis/orders.md), and [Reports](apis/reports.md); Orders and Listings Items also include credential-safe Python examples and error handling. The next batch covers [Finances](apis/finances.md), [Feeds](apis/feeds.md), and [FBA Inventory](apis/fba-inventory.md). See the [Notifications integration guide](guides/notifications-integration.md) for Amazon event delivery and optional forwarding to application webhooks. The longer [Catalog Items integration guide](apis/catalog-items.md) preserves the existing workflow examples.

The current deep coverage is focused on seller onboarding, active listing migration, catalog enrichment, and the associated API connections. These operation dossiers are documentation reviews, not sandbox or production tests. Dossiers for the remaining API families are still pending. Each operation must be checked for its current model version, seller/vendor eligibility, role, region, input/output schema, rate limit, pagination, and workflow before implementation.

**Documented** means Amazon's linked documentation describes the behavior. **Recommended** labels engineering practices, not provider guarantees. **Tested** is reserved for behavior observed in an authorized environment with scope/date recorded; no material in this guide currently has that status.

## Important separation of data

- A **seller listing** is a seller's SKU and offer in a marketplace.
- A **catalog item** is shared Amazon product information and does not establish that a seller offers the product.
- A **product type definition** supplies current listing attribute requirements for a product type and marketplace.
- **Inventory** depends on fulfillment channel. Merchant-fulfilled stock and FBA inventory must not be merged as if they shared one owner.
- A **report** is an asynchronous snapshot; notifications are event signals. Neither automatically replaces current-state reads and reconciliation.

Amazon's API versions, roles, rate plans, authorization requirements, marketplace support, and deprecation dates change. Check the official references linked on each page before building or publishing a production claim.

## Official starting points

- [SP-API Welcome page](https://developer-docs.amazon.com/sp-api/docs/welcome) — directory for the API references, code recipes, models, release notes, and deprecation schedule.
- [Interactive API references](https://developer-docs.amazon.com/sp-api/reference) — operation-level endpoint details.
- [Official code recipes](https://developer-docs.amazon.com/sp-api/recipes) — task-oriented implementation walkthroughs.
- [SP-API Models directory](https://developer-docs.amazon.com/sp-api/docs/sp-api-models)
- [Official versioned models repository](https://github.com/amzn/selling-partner-api-models) — Swagger/OpenAPI artifacts, client libraries, and JSON schemas.
- [Seller use cases](https://developer-docs.amazon.com/sp-api/docs/sp-api-seller-use-cases)
- [Developer onboarding](https://developer-docs.amazon.com/sp-api/docs/onboarding-overview)
- [Role mappings](https://developer-docs.amazon.com/sp-api/docs/role-mappings)
- [Listings management workflow guide](https://developer-docs.amazon.com/sp-api/docs/building-listings-management-workflows-guide)
- [SP-API rate-limit guidance](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits)
