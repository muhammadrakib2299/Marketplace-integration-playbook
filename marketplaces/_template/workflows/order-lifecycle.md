# Workflow: order lifecycle

> **API/version:** [version] · **Region:** [scope] · **Last checked:** YYYY-MM-DD

## Evidence and sources

- **Official:** [[provider order guide]]([url]) — checked YYYY-MM-DD.
- **Tested:** [scenario/environment/date, if applicable].
- **Unverified:** [unknown behavior or edge cases].

## Scope and ownership

Identify which system is authoritative for order creation, edits, cancellation, fulfillment status, and customer-facing updates. State included order types and exclusions.

## Flow

1. **Discovery:** webhook or polling; include event/cursor, pagination, windowing, and recovery behavior.
2. **Validation:** required fields, payment/hold state, address, lines, quantities, currency, tax, and unsupported cases.
3. **Deduplication:** stable provider order/line IDs, uniqueness constraints, and duplicate delivery handling.
4. **Ingestion:** mapping, persistence, acknowledgement deadline, and safe handling of partial orders.
5. **Warehouse processing:** reservation/allocation, picking, packing, splits, and backorder rules where supported.
6. **Fulfilment:** shipment/label creation, tracking update, dispatch confirmation, and resulting marketplace state.
7. **Exceptions:** cancellation, stock shortfall, address issue, rejected update, return/refund, and manual recovery.
8. **Reconciliation:** rescan strategy, cursor/watermark, comparison keys, safe repair, and rate protection.

## State transitions

| From | Trigger/action | To | Source / evidence | Recovery if it fails |
|---|---|---|---|---|
| [state] | [event/API action] | [state] | [link or test] | [safe recovery] |

Do not infer provider statuses from similarly named states in another channel. Preserve unknown statuses and document mapping choices.

## Reliability notes

Document idempotency, duplicate/out-of-order events, retries, rate limits, timeouts, partial success, webhook verification, and replay. Mark undocumented behavior as unknown. Never publish real order IDs, customer data, tokens, or private logs.
