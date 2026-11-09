# Fulfillment API

**Coverage:** official-reference review only. No shipment was created and no carrier or FBT account was tested.

The Fulfillment API connects TikTok Shop orders to third-party logistics providers, TikTok-provided shipping-label services, and Fulfilled by TikTok (FBT). The official overview describes both 3PL and 4PL patterns and access to fulfillment status. Confirm the order entity tag, shop identifier, shipping mode, and required scopes on each live operation page.

A fulfillment integration should keep the TikTok order, package, shipment, carrier, tracking number, label, pickup/collection state, and delivery state as separate records. Shipment creation acceptance is not proof that a carrier has collected a package. Reconcile the fulfillment state with Order API status and carrier events.

Official source: [Fulfillment API overview](https://partner.tiktokshop.com/docv2/page/fulfillment-api-overview).

# Logistics API

**Coverage:** official-reference review only. No warehouse or delivery-provider lookup was performed.

The Logistics API supports logistics context when sellers use TikTok Shop-provided services. TikTok's overview calls out warehouse lists, global warehouse lists, subscribed delivery options, and shipping providers. Logistics lookup data should be cached with an explicit market and retrieval time; do not assume that a provider or warehouse is valid for every target shop.

Official source: [Logistics API overview](https://partner.tiktokshop.com/docv2/page/logistic-api-overview).

# Finance API

**Coverage:** official-reference review only. No payment or settlement data was retrieved.

The Finance API helps sellers obtain payment and settlement information. Keep financial events separate from order totals and shipment status. Reconcile using provider identifiers and reporting periods, and preserve currency, fee, tax, adjustment, and settlement status fields from the current endpoint schema.

Official source: [Finance API overview](https://partner.tiktokshop.com/docv2/page/finance-api-overview).
