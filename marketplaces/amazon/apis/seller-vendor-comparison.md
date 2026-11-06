# Amazon SP-API: seller vs. vendor directory comparison

> Directory basis: Amazon's SP-API Models index snapshot reviewed 2026-11-06, compared with Amazon's seller and vendor use-case directories. These labels describe the audience/use-case emphasis supported by those sources; they do not grant API access or prove an API is exclusive to one party type. Verify the current model, operation, role, application authorization, seller/vendor program, region, and marketplace before implementation.

Amazon organizes SP-API by use case, not as two disjoint product catalogs. Some API families appear in both seller and vendor use-case documentation; some common surfaces are used for different datasets or programs. Vendor Direct Fulfillment is a clear vendor-specific cluster. Seller APIs make up most of the directory and cover catalog/listings, seller-fulfilled and FBA operations, orders, finance, reporting, and account functions. The directory's labels alone are not a complete entitlement matrix.

## Comparison of the 57 directory entries

| # | Directory entry | Audience classification from official directory/use-case evidence | Practical reading |
|---:|---|---|---|
| 1 | A+ Content Management API | Shared | Present in seller and vendor marketing-content use cases. |
| 2 | Amazon Warehousing and Distribution API | Seller/program-oriented | AWD inbound and inventory workflows; confirm account/program eligibility. |
| 3 | App Integrations API | Seller-facing / partner-dependent | App-to-selling-partner notifications; confirm current onboarding and operation access. |
| 4 | Application Management API | Developer/application administration | Manages registered application credentials; not a seller/vendor business-data API. |
| 5 | Catalog Items API | Shared | Used for catalog facts in seller and vendor catalog-management use cases. |
| 6 | Customer Feedback API | Seller-oriented | Customer review/return insights; verify current seller eligibility and access requirements. |
| 7 | Data Kiosk API | Seller-oriented in documented dataset scope | Current directory describes Seller Sales and Traffic Data; do not infer vendor dataset access. |
| 8 | Delivery by Amazon API | Seller/program/region restricted | Brazil-only and Restricted Availability according to Amazon's directory. |
| 9 | Easy Ship API | Seller/program/marketplace restricted | Easy Ship program only; availability depends on supported store and seller participation. |
| 10 | External Fulfillment Inventory | Seller/program-specific | Inventory across named external fulfillment channels; eligibility depends on channel/program. |
| 11 | External Fulfillment Returns | Seller/program-specific | External Fulfillment returns data; verify participating program. |
| 12 | External Fulfillment Shipping | Seller/program-specific | External Fulfillment order/shipping processes; verify participating program. |
| 13 | FBA Inbound Eligibility API | Seller/FBA | Eligibility preview for inventory intended for Amazon fulfillment. |
| 14 | FBA Inventory API | Seller/FBA | Seller's inventory held in Amazon's fulfillment network. |
| 15 | Feeds API | Seller/vendor use-case dependent | Feed types determine supported workflow and account cohort; inspect each feed type. |
| 16 | Finances API | Seller-oriented | Seller financial events; do not confuse with vendor remittance APIs. |
| 17 | Finance Remittance API | Vendor | Vendor remittance and payment deductions. |
| 18 | Fulfillment Inbound API | Seller/FBA | Inbound shipments to Amazon fulfillment; confirm current inbound workflow and program. |
| 19 | Fulfillment Outbound API | Seller/MCF | Multi-Channel Fulfillment orders for sellers. |
| 20 | Invoices API | Seller/region/use-case dependent | Invoice use cases vary by marketplace, invoice type, and program. |
| 21 | Invoices API (Brazil Only) | Seller/FBA/region restricted | Directory says Brazilian FBA invoices only. |
| 22 | Listings Items API | Shared | Official directory lists sellers and vendors; operation permissions and listing behavior still differ by use case. |
| 23 | Listings Restrictions API | Seller/catalog workflow | Listing eligibility preflight; verify seller authorization and operation scope. |
| 24 | Merchant Fulfillment API | Seller | Buy Shipping for seller-fulfilled orders; Amazon advises new integrations to use Shipping API v2 instead. |
| 25 | Messaging API | Seller | Buyer-seller messages and seller response workflows. |
| 26 | Notifications API | Shared / event-specific | Supports subscriptions on behalf of sellers or vendors where a notification type allows it. |
| 27 | Orders API | Seller | Seller order synchronization and research; use current version and operation-specific roles. |
| 28 | Product Fees API | Seller | Fee estimates used in seller pricing decisions; estimates are not guaranteed actual fees. |
| 29 | Product Pricing API | Seller | Offer/pricing data and repricing workflows. |
| 30 | Product Type Definitions API | Shared | Appears in seller and vendor catalog-management use cases; schemas/requirements remain marketplace and product-type specific. |
| 31 | Promotions API | Seller-oriented; verify vendor reporting separately | Seller promotion management is distinct from promotion-performance reports that may be available in vendor reporting. |
| 32 | Replenishment API | Seller/vendor-dependent | Subscribe & Save program; Amazon says some attributes/use cases may not apply to both cohorts. |
| 33 | Reports API | Shared surface; report-type gated | Seller and vendor use cases identify different report types; eligibility is report-specific. |
| 34 | Sales API | Seller-oriented | Seller sales-performance metrics; do not assume it is the same surface as vendor analytics. |
| 35 | Seller Wallet API | Seller | Seller Wallet balances, events, and transfers. |
| 36 | Sellers API | Seller | Seller account and marketplace information. |
| 37 | Services API | Seller/service-provider program | Service orders, appointments, resource capacity, and fulfillment. |
| 38 | Shipment Invoicing API | Seller/FBA/Brazil restricted | Shipment invoice information for FBA orders in Brazil. |
| 39 | Shipping API | Seller-facing shipping | Shipping rates, shipment creation/cancellation, and tracking; check supported program and region. |
| 40 | Solicitations API | Seller | Seller requests for reviews and feedback using supported solicitation templates. |
| 41 | Support API | Selling-partner support | Selling-partner support cases; availability in Amazon stores does not imply every role/app can access every record. |
| 42 | Supply Sources API | Seller | Seller supply-source configuration and capabilities. |
| 43 | Tokens API | Cross-cutting / operation-dependent | Restricted Data Token workflows for APIs that require them; entitlement follows the underlying resource and app authorization. |
| 44 | Transfers API | Seller | Payouts to a seller's deposit method and seller payment instruments. |
| 45 | Tracking API | Shared | Listed in both seller and vendor supply-chain use cases; relevant shipments/channels differ. |
| 46 | Uploads API | Cross-cutting / operation-dependent | Upload interface for documents used by other APIs; access follows the consuming workflow. |
| 47 | Vehicles API | Seller/listing-specific | Vehicle compatibility data used with listing workflows; confirm current store and model support. |
| 48 | Vendor Direct Fulfillment Inventory API | Vendor | Vendor direct-fulfillment inventory exchange. |
| 49 | Vendor Direct Fulfillment Orders API | Vendor | Vendor direct-fulfillment purchase orders and acknowledgments. |
| 50 | Vendor Direct Fulfillment Payments API | Vendor | Vendor direct-fulfillment payment-related documents. |
| 51 | Vendor Direct Fulfillment Sandbox Test Data API | Vendor/sandbox | Test data for vendor direct-fulfillment sandbox workflows; not a production business-data surface. |
| 52 | Vendor Direct Fulfillment Shipping API | Vendor | Vendor direct-fulfillment shipping data and operations. |
| 53 | Vendor Direct Fulfillment Transaction Status API | Vendor | Status for vendor direct-fulfillment asynchronous transactions. |
| 54 | Vendor Invoices API | Vendor | Vendor invoice/payment data. |
| 55 | Vendor Orders API | Vendor | Vendor retail purchase-order data. |
| 56 | Vendor Shipments API | Vendor | Vendor retail shipment data. |
| 57 | Vendor Transaction Status API | Vendor | Status for vendor asynchronous POST transactions. |

## What differs in practice

**The business relationship and data model differ.** Seller workflows generally manage offers, seller-fulfilled or FBA inventory, marketplace orders, seller payments, and seller account settings. Vendor workflows generally manage retail procurement, vendor purchase orders, shipments, invoices/remittance, and direct-fulfillment transactions. Similar names do not mean the same party owns the object or can use the same operation.

**Shared APIs are not necessarily shared permissions or payloads.** Catalog Items is shared product-catalog lookup. Listings Items is listed for both seller and vendor accounts, but listing authorization, identifiers, product types, and workflow rules still need operation-level checking. Reports and Notifications are common surfaces with report-type/event-type-specific eligibility. Product Type Definitions is used in both catalog-management contexts. Tracking appears in both supply-chain use-case directories.

**Program and geography can be narrower than party type.** Easy Ship, FBA, Multi-Channel Fulfillment, External Fulfillment, Vendor Direct Fulfillment, Brazil invoice surfaces, and restricted-availability APIs require their relevant program, region, store, and account status. A broad label such as “seller” or “vendor” is insufficient to authorize a call.

**Treat common utility APIs as dependencies, not blanket entitlements.** Tokens, Uploads, Reports, Feeds, and Notifications may support other APIs. The underlying operation or payload can impose distinct roles, restricted-data handling, report/feed/event eligibility, and application requirements.

## How to use this classification

1. Decide whether the integration acts for a seller, a vendor, or both; do not treat an Amazon retail vendor as a marketplace seller.
2. Select the relevant use case and program, then choose the API operation and current version. Validate party eligibility at operation level from its live reference and versioned model.
3. Check application authorization, roles, region/endpoint, marketplace/store, restricted availability, and report/feed/notification type before implementation.
4. Keep seller and vendor identifiers, statuses, financial objects, and fulfillment state in distinct models unless an explicit business mapping is documented.
5. Revisit this page when Amazon updates the Models directory or either use-case directory. The API family count is not an operation count or a permission grant.

## Official sources

- [SP-API Models directory](https://developer-docs.amazon.com/sp-api/docs/sp-api-models)
- [SP-API Seller Use Cases](https://developer-docs.amazon.com/sp-api/docs/sp-api-seller-use-cases)
- [SP-API Vendor Use Cases](https://developer-docs.amazon.com/sp-api/docs/sp-api-vendor-use-cases)
- [Amazon SP-API models repository](https://github.com/amzn/selling-partner-api-models)
- [Role mappings](https://developer-docs.amazon.com/sp-api/docs/role-mappings)
- [Usage plans and rate limits](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits)
