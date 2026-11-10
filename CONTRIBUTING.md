# Contributing

Thanks for helping make this playbook accurate and useful. Small, well-sourced updates are welcome. Each marketplace should have a focused guide, clear access status, and dates that help readers judge freshness.

## Before you contribute

Only submit content you are authorized to publish. Do not contribute employer or client confidential information, internal implementation details, proprietary source code, credentials, personal data, private API documentation, or copied provider text/assets without redistribution permission. The one exception is a marketplace's own logo from the Simple Icons set (the `simple-icons` package), referenced unaltered through the catalog `logo` field and used only to identify that marketplace. Do not test APIs using accounts or systems without authorization. Use synthetic identifiers and payloads in examples.

## Add or update an entry

1. Check for an existing marketplace folder and catalog entry. Avoid duplicates; use a shared-platform page when multiple brands use the same API.
2. Confirm the entity type, market/region, API surface, and access model. Do not treat a campaign, carrier, storefront, integrator, or marketplace operator as interchangeable with a marketplace.
3. Start from `marketplaces/_template/` and complete the required sections. Keep optional topics only when relevant.
4. Add primary provider sources near the claims they support. Include page title, URL, API/version scope where known, and `last checked` date. Prefer official sources; label secondary sources as context only.
5. Separate official statements, personally tested observations, and unverified assumptions. Say exactly what testing covered.
6. Update `catalog/marketplaces.yaml` to match the guide, and list its guides in `catalog/guides.yaml` under the right topic, so they count toward the marketplace's coverage on its overview page and in the directory. Do not claim an integration is implemented merely because a guide exists.
7. Review the diff for sensitive data, unsupported claims, broken links, duplicate instructions, and unnecessary copied documentation.

## API dossier pages

An operation-level API page (a dossier) starts with frontmatter instead of a Markdown H1:

```yaml
---
title: Amazon Orders API dossier
api: Orders API
version: 2026-01-01
checked: 2026-11-06
evidence_status: Official reference and versioned model reviewed; no sandbox or live account tests performed
---
```

- `title` and `api` together turn on the dossier header, which renders `title` as the page's H1. Do not also start the page with a `# Heading`; the site hides a leading Markdown H1 on dossiers so a page never shows two.
- `api` must match an `api_surfaces[].name` in the marketplace's catalog entry for the header to link that surface's official reference (`docs_url`).
- `version` and `checked` appear as chips in the header; `checked` and `evidence_status` also fill the evidence card in the right rail.
- Pages without this frontmatter keep their own Markdown H1 and get no dossier header.

## New-entry checklist

- [ ] Stable lowercase-hyphenated folder name; no duplicate integration surface.
- [ ] Catalog has name, category, region, status, access model, docs URL, and verification date.
- [ ] Overview identifies the provider, product/API surface, region, intended scope, and limitations.
- [ ] Official API, auth, changelog/version, and access-policy links are included where available.
- [ ] Setup, permission scopes, credentials handling, and onboarding prerequisites are described without secrets.
- [ ] Core resources and data direction are clear; important field mappings and state transitions are documented.
- [ ] Relevant API groups and operation counts are sourced, scoped, and distinguished from the provider's full portfolio; unknown totals are labeled instead of estimated.
- [ ] Cross-API dependencies, ordered operation calls, workflow conditions, provider timelines, and limits are mapped to official references.
- [ ] Minimal synthetic payload examples and Python/NestJS walkthroughs are included where useful, clearly marked as illustrative and without secrets or real personal data.
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
