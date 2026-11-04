# Data mapping: [marketplace]

> **API/version:** [version] · **Region:** [scope] · **Last checked:** YYYY-MM-DD

## Mapping principles

State source of truth by entity, persistence needs, and whether each mapping is inbound, outbound, or bidirectional. Keep provider IDs alongside stable local IDs. Do not assume fields with similar names have the same semantics across platforms. Unknown enum values should be preserved safely rather than silently coerced.

## Entity relationships

Describe how seller SKU, product, variant, offer/listing, location, order, order line, shipment, return, and refund identifiers relate. Note whether IDs are globally unique, seller-scoped, region-scoped, or version-scoped only when verified.

## Field mapping

| Local field | Provider field | Direction | Type/format | Transform/default | Required/conditional | Evidence/source |
|---|---|---|---|---|---|---|
| [field] | [field] | Inbound / outbound / both | [type] | [rule] | [rule] | [link; label] |

Include meaningful product attributes, variant/SKU/barcode, quantity, price, currency, tax, address, shipment, status, timestamps, and locale fields relevant to this API. Link provider schemas instead of reproducing them.

## Status mapping

| Local state | Provider state/event | Allowed transition | Direction | Handling of unknown/invalid value | Source |
|---|---|---|---|---|---|
| [state] | [state] | [transition] | [direction] | [safe behavior] | [link] |

Document terminal states, partial states, cancellations, refunds, returns, and shipment states separately when their semantics differ. Preserve provider semantics and cite official definitions.

## Regional, financial, and privacy considerations

Document currencies, rounding/precision, tax representation, units, locale, character encoding, time zone, address conventions, and data residency only when relevant and verified. Identify personal data and recommend minimization, access control, retention, and redaction. Use no actual customer data in examples.

## Open questions

List unresolved mappings or provider ambiguities with owner/source needed, and label them unverified. Do not fill gaps with assumptions presented as fact.
