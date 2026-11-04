# Testing and release: <marketplace>

> **Last checked:** YYYY-MM-DD · **API/version:** <version> · **Environment:** <sandbox/test account/other>

## Environment and access

Document official sandbox availability, test-account prerequisites, regional coverage, test-data rules, API credentials setup (never values), and any provider approval. Mark unknowns clearly.

## Test matrix

| Area | Scenario | Expected result / source | Tested? | Notes |
|---|---|---|---|---|
| Authentication | valid, expired, revoked token | <expected> | No | |
| Authorization | missing/insufficient scope | <expected> | No | |
| Pagination | multiple pages, empty page, cursor boundary | <expected> | No | |
| Throttling | quota response and recovery | <expected> | No | |
| Idempotency | duplicate create/update/event | <expected> | No | |
| Ordering | delayed or out-of-order notification | <expected> | No | |
| Partial failure | mixed success in batch | <expected> | No | |
| Reconciliation | missed event / resync | <expected> | No | |
| Data mapping | nulls, unknown enum, locale/currency | <expected> | No | |
| Business flow | order through dispatch/tracking | <expected> | No | |
| Privacy | log redaction and data minimization | <expected> | No | |

Replace generic cases with provider-specific scenarios. “Not tested” is a valid result. Avoid making tests against live customer accounts or production data without explicit authorization.

## Test evidence

For each test record date, API/version, region, environment, scenario, result, and relevant request/correlation ID only if it is non-sensitive and safe to publish. Use sanitized synthetic payloads. Never commit access tokens, personal data, seller identifiers, private traces, or provider-confidential responses.

## Release readiness

- [ ] Permissions/scopes are least-privilege and account setup has been reviewed.
- [ ] Secrets are held outside source control; rotation/revocation is understood.
- [ ] Timeouts, bounded retries, throttling, idempotency/deduplication, and partial failures are handled.
- [ ] Webhook signature validation or polling cursor/replay strategy is covered.
- [ ] Logs/metrics redact sensitive fields and expose sync lag and error categories.
- [ ] Backfill and reconciliation are rate-limited and recoverable.
- [ ] A staged rollout, monitoring, support path, and rollback plan exist where applicable.
- [ ] API version/changelog/deprecation risk has been reviewed.

This is general engineering guidance unless a provider-specific source is cited. Do not claim a production integration exists based only on this checklist.
