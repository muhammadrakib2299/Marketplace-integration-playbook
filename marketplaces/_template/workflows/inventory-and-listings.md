# Workflow: inventory and listings

> **API/version:** [version] · **Region:** [scope] · **Last checked:** YYYY-MM-DD

## Sources and evidence

- **Official:** [[provider listing/inventory guide]]([url]) — checked YYYY-MM-DD.
- **Tested:** [authorized test and date, if any].
- **Unverified:** [open questions].

## Product identity and setup

Describe product, variant, offer/listing, seller SKU, provider-generated ID, barcode, and location relationships. Explain required attributes, category/taxonomy, content validation, image rules, locale/currency, and account approval as sourced. Link to official schemas.

## Listing lifecycle

Document create, update, publish/submit, moderation/rejection, pause, delete, and relisting where supported. Include asynchronous processing or status polling, validation errors, and safe idempotent update behavior. Do not claim marketplace acceptance until the provider confirms it.

## Inventory publication

Describe stock source of truth, available-to-sell calculation, safety buffer, reservations, per-location quantities, update trigger, batching, and reconciliation. Specify whether zero means out-of-stock or another state only when documented. Explain handling of delayed sync and oversell risk.

## Mapping table

| Local field | Provider field | Direction | Transform/default | Required? | Source / confidence |
|---|---|---|---|---|---|
| [field] | [field] | [to/from/both] | [rule] | [yes/no/unknown] | [link/label] |

## Failure and recovery

Cover invalid attributes, restricted products, duplicate SKU/offer, throttling, partial batch results, rejected listings, stale stock, and provider outages. Document retryability, alerting, manual correction, and reconciliation without inventing provider behavior.
