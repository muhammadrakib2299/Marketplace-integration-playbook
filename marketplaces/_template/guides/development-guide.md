# Development guide: [marketplace]

| Field | Value |
|---|---|
| Evidence labels | Official = provider documentation; Tested = directly observed in an authorized environment; Unverified = not confirmed. |
| API/version | [version] |
| Region | [scope] |
| Last checked | YYYY-MM-DD |

## 1. Integration scope and constraints

State supported seller types, countries, account prerequisites, API surfaces, channel capabilities, and out-of-scope functions. Identify whether onboarding requires approval or a certified integrator. Link official access and eligibility rules. Do not assume an endpoint is available to all sellers because it appears in API reference pages.

## 2. System context and data direction

Describe the participants (seller account, marketplace, integration service, inventory/order system) and which system owns each record. State data direction and source of truth for product, offer/listing, stock, order, shipment, cancellation, refund, and return data. Include a small diagram when useful.

## 3. Setup and onboarding

List account and application creation, approval, environment selection, seller authorization, redirect/callback setup, scopes, IP allowlists, certificates, regional hostnames, and required account settings. Explain how to rotate/revoke credentials and how to configure multiple shops/regions. Never place secrets in repository content.

## 4. Authentication and authorization

Link `authentication.md`. Explain token acquisition, signing, scopes, expiration, refresh, clock/skew requirements, request signing, credential storage, rotation, revocation, and safe logging. Be precise about which mechanisms are documented versus inferred. Give pseudocode or synthetic examples only.

## 5. API surface and core resources

List the relevant API groups and resource IDs; explain which calls are read, create, update, acknowledge, or delete operations. Note API versions, regional base URLs, required headers, content types, and versioning/deprecation policies. Link the provider's reference rather than reproducing it.

## 6. Data model and mapping

Link `data-mapping.md`. Cover identifiers and uniqueness, SKU/variant relationships, bundles, currency, tax, measurement units, locale, address/contact data, timestamps/time zones, status enums, nullable fields, and unknown enum values. Explain how to handle provider-generated IDs and preserve the mapping between local and remote entities. Avoid storing more personal data than required.

## 7. Operational workflows

Link the detailed workflow documents. For each workflow specify trigger, preconditions, API calls, state transitions, side effects, success criteria, duplicate handling, and recovery/reconciliation path. Cover the applicable flows:

- Catalog, product, variant, offer/listing creation and updates.
- Inventory publication, reservations, location/warehouse allocation, and stock reconciliation.
- Order discovery (webhook and/or polling), ingestion, acknowledgement, and deduplication.
- Picking/packing readiness, shipment creation, label/tracking update, dispatch confirmation, and delivery status.
- Cancellation, partial shipments, refunds, returns, exchanges, and disputes where supported.

Do not imply the provider supports a workflow unless official documentation or authorized testing confirms it.

## 8. Events, polling, and ordering

Document webhook subscription and signature validation, delivery guarantees, retry behavior, event IDs, duplicate/out-of-order delivery, acknowledgement deadlines, and replay support. If polling is used, document cursor/watermark strategy, overlap windows, pagination, missed-update recovery, and safe polling frequency. If unknown, say so.

## 9. Reliability and error handling

Classify validation, authentication/authorization, conflict, throttling, server, network, and business-rule errors. Document retryable vs non-retryable failures, exponential backoff with jitter, `Retry-After` handling, request timeouts, circuit breaking where appropriate, idempotency keys or deduplication strategy, and dead-letter/manual recovery. Never retry non-idempotent writes blindly. Explain how partial success is detected and repaired.

## 10. Quotas, performance, and concurrency

Record documented quotas by endpoint/account/region, burst rules, concurrency constraints, batch limits, payload limits, and timeouts. Link the official quota source and date. Describe backpressure, request prioritization, caching, and safe parallelism. Mark undocumented limits as unknown; do not invent numbers.

## 11. Security, privacy, and compliance

Use least privilege and encrypted secret storage. Redact credentials and personal data in logs. Define retention/deletion expectations, access controls, audit events, webhook verification, and incident response assumptions. Link provider security/privacy/retention policies where relevant. Do not publish live data or secrets in examples or test fixtures.

## 12. Testing strategy

Link `testing-and-release.md`. Cover unit tests with synthetic fixtures, contract/schema tests, sandbox tests, negative cases, duplicate/out-of-order events, throttling, token expiry, partial failures, reconciliation, and regression tests. State sandbox limitations and exactly what was tested. Do not describe a mock as provider-verified behavior.

## 13. Observability and support

List non-sensitive metrics (request volume, latency, error classes, throttling, queue age, sync lag, reconciliation drift), structured log fields, correlation/request IDs, alert conditions, and escalation routes. Link official support/status pages. Never include customer data or credentials in logs/examples.

## 14. Rollout and API change management

Describe feature flags, staged rollout, canary/limited seller rollout, backfill and rate protection, rollback, replay/reconciliation, and monitoring. Track API changelog/deprecation dates, version pinning, compatibility tests, and required migration steps. Clearly label any rollout advice as general guidance if not provider-specific.

## 15. Open questions and verification record

| Question or claim | Evidence label | Source or test | Region/version | Checked |
|---|---|---|---|---|
| [item] | Official / Tested / Unverified | Source URL or test note | [scope] | YYYY-MM-DD |

## References

- Official API reference URL — [version/scope], checked YYYY-MM-DD.
- Official changelog URL — checked YYYY-MM-DD.
