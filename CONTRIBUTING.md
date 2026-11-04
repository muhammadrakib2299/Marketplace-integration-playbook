# Contributing

Thanks for helping make this playbook accurate and useful. Small, well-sourced updates are welcome. Each marketplace should have a focused guide, clear access status, and dates that help readers judge freshness.

## Before you contribute

Only submit content you are authorized to publish. Do not contribute employer or client confidential information, internal implementation details, proprietary source code, credentials, personal data, private API documentation, or copied provider text/assets without redistribution permission. Do not test APIs using accounts or systems without authorization. Use synthetic identifiers and payloads in examples.

## Add or update an entry

1. Check for an existing marketplace folder and catalog entry. Avoid duplicates; use a shared-platform page when multiple brands use the same API.
2. Confirm the entity type, market/region, API surface, and access model. Do not treat a campaign, carrier, storefront, integrator, or marketplace operator as interchangeable with a marketplace.
3. Start from `marketplaces/_template/` and complete the required sections. Keep optional topics only when relevant.
4. Add primary provider sources near the claims they support. Include page title, URL, API/version scope where known, and `last checked` date. Prefer official sources; label secondary sources as context only.
5. Separate official statements, personally tested observations, and unverified assumptions. Say exactly what testing covered.
6. Update `catalog/marketplaces.yaml` to match the guide. Do not claim an integration is implemented merely because a guide exists.
7. Review the diff for sensitive data, unsupported claims, broken links, duplicate instructions, and unnecessary copied documentation.

## New-entry checklist

- [ ] Stable lowercase-hyphenated folder name; no duplicate integration surface.
- [ ] Catalog has name, category, region, status, access model, docs URL, and verification date.
- [ ] Overview identifies the provider, product/API surface, region, intended scope, and limitations.
- [ ] Official API, auth, changelog/version, and access-policy links are included where available.
- [ ] Setup, permission scopes, credentials handling, and onboarding prerequisites are described without secrets.
- [ ] Core resources and data direction are clear; important field mappings and state transitions are documented.
- [ ] Order/listing/inventory/fulfilment/returns workflows are included when applicable.
- [ ] Pagination, rate limits, retries, idempotency, webhooks/polling, and reconciliation are addressed or marked unknown/not applicable.
- [ ] Testing and release instructions explain sandbox availability and what was actually tested.
- [ ] Errors, observability, security, privacy, and API change risks are covered.
- [ ] Examples are synthetic, safe, and clearly labeled; no credentials, personal data, or restricted material.
- [ ] All material claims have nearby sources and dates; uncertain information is labeled.
- [ ] Links and YAML are validated; no third-party documentation has been copied wholesale.

## Pull request description

Please state: what changed; which official sources were checked; which API version, region, and access level apply; what was tested (if anything); what remains uncertain; and whether the change adds new original text or sanitized examples. Include a brief confirmation that you have permission to publish the contribution.

## Maintenance

When a provider changes an API, update the affected guide and verification date. Add a note to the folder's `changelog.md` for meaningful changes. Do not silently delete important deprecation information; mark old behavior as deprecated and link to the replacement when known.
