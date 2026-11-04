# Integration principles

## Model a marketplace connection as a lifecycle

A useful integration guide follows records as they move through the channel, rather than listing endpoints without context. Document setup and authorization, catalog/listing, inventory, order ingestion, fulfilment, shipment and tracking, cancellations, returns/refunds, and reconciliation where relevant. For every flow identify triggers, source of truth, identifiers, state transitions, side effects, and recovery path.

## Preserve evidence and uncertainty

Use primary official provider sources wherever possible. Place citations next to claims and include API/version and region scope plus a last-checked date. Separate provider-published rules (**Official**) from behavior tested in an authorized environment (**Tested**) and unresolved claims (**Unverified**). A missing public doc or an inaccessible partner portal is not evidence that a feature exists or does not exist.

## Handle distributed-system realities

Assume network failures, duplicate deliveries, delayed or out-of-order events, throttling, partial batch results, token expiry, and schema evolution unless the provider establishes otherwise. Document idempotency or deduplication, bounded retries with backoff, cursor-safe pagination, replay/reconciliation, unknown enum handling, and manual recovery. Never prescribe blind retries for non-idempotent operations.

## Make region and access explicit

Marketplace names can span different legal entities, regions, API hosts, seller programs, and partner arrangements. Record these as first-class scope. Explain whether access is public, seller-account based, approval-required, partner-only, or unknown. Do not turn an approved-partner integration into a claim of generally available API access.

## Protect people and intellectual property

Publish original summaries and links, not wholesale copies of API references. Use synthetic examples. Exclude secrets, personal/customer data, proprietary implementation details, internal tickets, and content without redistribution rights. Check employer obligations and provider terms before publishing.

## Keep the guide maintainable

Use one focused folder per distinct API surface. Put shared concepts in `docs/` and link to them instead of copying common material. Keep provider-specific facts in the marketplace folder. Add a verification date when substantive claims are rechecked and note material changes in the local changelog.
