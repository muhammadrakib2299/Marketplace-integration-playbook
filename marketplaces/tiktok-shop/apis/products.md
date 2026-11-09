# Products API

**Coverage:** official-reference review only. No product was created, edited, reviewed, or deleted. Use the live [Products API overview](https://partner.tiktokshop.com/docv2/page/products-api-overview) and endpoint reference for current versions, schemas, limits, and scopes.

The Product API is the catalog surface for TikTok Shop sellers. TikTok documents product category rules, attributes, media and file uploads, product creation and editing, product detail/list retrieval, price, and inventory-related product data. Global Product APIs are available for cross-border use cases, but market eligibility and operation support must be confirmed for the seller and app.

## Catalog concepts

Every product belongs to a TikTok-defined category. Categories form a tree and determine required and optional attributes. Product attributes describe the product generally; sales attributes describe variant/SKU values such as size or color; custom attributes add seller-provided information where allowed.

A product may be created as a draft or live product. TikTok reviews products after creation or editing. If an edit to a live product fails review, the live version remains the earlier approved snapshot; the review version can be requested from the detail operation with the documented audit-version parameter.

## Product lifecycle

| Status | Meaning documented by TikTok |
|---|---|
| `Draft` | Not visible to TikTok Shop users; can be completed before activation. |
| `Pending` | Under TikTok review. |
| `Failed` | Failed review. |
| `Activate` | Visible and available for purchase, subject to stock. |
| `Seller_deactivated` | Removed from the shelf by the seller; data remains available. |
| `Platform_deactivated` | Deactivated by TikTok; seller may edit and resubmit. |
| `Freeze` | Frozen for policy violation; appeal or remediation may be required. |
| `Deleted` | Removed from the catalog; historical data may no longer be available. |

Do not model `Activate` as equivalent to in-stock. Preserve the raw status, SKU inventory, review result, and policy reason separately.

## Operation map

The official overview and product reference organize the surface around category retrieval, brand and authorization checks, attribute retrieval, file/media upload, product creation, product list/detail retrieval, editing, activation/deactivation, deletion, and price/inventory updates. Exact operation names and API versions vary by page and market; use the live version selector instead of hardcoding a version from this summary.

A safe catalog workflow is: resolve category, fetch required attributes, validate brand/certification requirements, upload media, create a draft or live product, observe review status, reconcile the approved detail, and then manage price and inventory. Keep your source product, TikTok product, SKU, and review records distinct so a rejected edit cannot overwrite the last approved state.

## Marketplace constraints

TikTok documents brand authorization and product certification requirements for some categories. Regional policy and category availability can change. TikTok also documents probation-period upload limits for new sellers; do not turn the limits in this page into a universal quota for every seller or market. Read the current Product API and Seller Academy guidance for the target shop.

## Official sources

- [Products API overview](https://partner.tiktokshop.com/docv2/page/products-api-overview)
- [Create Product reference](https://partner.tiktokshop.com/docv2/page/create-product)
- [TTS API overview](https://partner.tiktokshop.com/docv2/page/tts-api-concepts-overview)
- [API versioning](https://partner.tiktokshop.com/docv2/page/api-versioning)
