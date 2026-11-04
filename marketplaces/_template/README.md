# [Marketplace or API surface]

| Field | Value |
|---|---|
| Documentation status | research / documented / tested / blocked / deprecated |
| Integration claim | documentation only / tested integration / production integration (only when authorized and evidenced) |
| Channel type | marketplace / storefront / marketplace operator / social commerce / aggregator / other |
| Regions / seller programs | [regions, seller/vendor program, or unknown] |
| API surface and version | [official name/version] |
| Access model | public / seller account / approval required / partner-only / mixed / unknown |
| Evidence | official / tested / mixed / unverified |
| Last verified | YYYY-MM-DD |
| Maintainer | [GitHub handle] |

This is an independent, source-linked guide, not an official provider document unless explicitly authorized. Product names belong to their owners. Do not add employer/client confidential information, credentials, customer data, restricted portal material, or content you lack permission to republish.

## At a glance

[In 2–4 sentences, identify the channel, intended integration use, and the information this folder covers. State clearly whether this is a guide or an implemented integration.]

| Item | Summary |
|---|---|
| Provider / legal entity | [Name and relevant operator] |
| API surface | [Name, API version, base host(s)] |
| Supported account types | [Seller, vendor, etc.; distinguish verified from unknown] |
| Region coverage | [Countries or provider region codes] |
| Authorization | [OAuth, private/self-authorized app, API key, partner access, unknown] |
| Access prerequisites | [Account, app approval, roles/scopes, partner status] |
| Sandbox | [Availability and relevant limitations] |
| Current documentation status | [Research / documented / tested / blocked / deprecated] |

## Scope and non-goals

### In scope

- [API groups, workflow, region, seller program, and version this guide covers.]
- [Direction of data movement and expected system boundary.]

### Out of scope

- [Other APIs, regions, seller types, products, or workflows not covered.]
- [Do not imply that the presence of API documentation means an integration is implemented or accessible to every seller.]

If multiple storefront brands share an operator API, document the shared surface here and link to brand-specific differences. If regional variants have distinct hosts, auth, fields, or lifecycle rules, separate them explicitly.

## Access and onboarding

Describe the real access path for each audience. Do not assume an endpoint is publicly usable just because its reference is visible.

1. [Seller/vendor eligibility and account prerequisites.]
2. [Developer profile and app registration.]
3. [Public-app review, partner approval, certification, allowlisting, or private-app setup.]
4. [Seller authorization, required roles/scopes, callback/redirect setup.]
5. [Regional accounts, marketplace participation, and any operational prerequisites.]
6. [Sandbox access and production-readiness requirements.]

State whether access is **public**, **seller-account based**, **approval required**, **partner-only**, **mixed**, or **unknown**, with a linked official source. Never put actual account IDs, secrets, tokens, or private contact details in this repository.

## Official sources and API versions

Use provider documentation as the source of truth. Cite the specific page, API version, region, and date checked. Summarize rather than copying long passages or provider schemas.

| Topic | Official source | Version / region | Checked |
|---|---|---|---|
| Developer onboarding / access policy | Official source URL | [scope] | YYYY-MM-DD |
| API overview / reference | Official source URL | [scope] | YYYY-MM-DD |
| Authentication / authorization | Official source URL | [scope] | YYYY-MM-DD |
| Data schemas / resource model | Official source URL | [scope] | YYYY-MM-DD |
| Rate limits / error handling | Official source URL | [scope] | YYYY-MM-DD |
| Changelog / deprecation schedule | Official source URL | [scope] | YYYY-MM-DD |
| Sandbox / testing | Official source URL | [scope] | YYYY-MM-DD |
| Status / support | Official source URL | [scope] | YYYY-MM-DD |

### Version and lifecycle notes

Record current versions and deprecation/removal dates. Mark older APIs as deprecated when the provider does. Do not recommend a deprecated endpoint for new integrations without a clear, sourced migration reason.

## Capability matrix

| Capability | Supported? | API / data object | Direction | Evidence / notes |
|---|---|---|---|---|
| Catalog / listings | yes / no / conditional / unknown | [API/version] | outbound / inbound / both | [source, region, caveat] |
| Inventory | yes / no / conditional / unknown | [API/version] | outbound / inbound / both | [source, stock semantics] |
| Order retrieval | yes / no / conditional / unknown | [API/version] | inbound | [filters, statuses, scope] |
| Shipment / tracking | yes / no / conditional / unknown | [API/version] | outbound / inbound | [fulfilment model] |
| Cancellation / return / refund | yes / no / conditional / unknown | [API/version] | both | [constraints] |
| Events / notifications | yes / no / conditional / unknown | [API/version] | inbound | [delivery mechanism] |

Only include capabilities supported by official documentation or authorized tests. Use `unknown` when the evidence is missing.

## Architecture and data ownership

Describe the systems that participate and name the source of truth for product, offer/listing, available inventory, order, shipment, tracking, cancellation, return, and refund data. Explain identifier mapping and whether updates are one-way or bidirectional. Include a small sequence or architecture diagram if it clarifies the flow.

State the expected behavior for multiple seller accounts, shops, marketplaces, currencies, warehouses, and fulfilment programs. Keep account-specific configuration separate from code and public documentation.

## Guides and workflows

Link focused documents rather than expanding this page into a single large manual.

### Guides

- [Development guide](guides/development-guide.md)
- [Authentication](guides/authentication.md) — remove if covered here or not applicable.
- [Data mapping](guides/data-mapping.md) — remove if covered here or not applicable.
- [Testing and release](guides/testing-and-release.md) — remove if covered here or not applicable.

### Workflows

- [Order lifecycle](workflows/order-lifecycle.md)
- [Inventory and listings](workflows/inventory-and-listings.md)
- [Fulfilment and returns](workflows/fulfilment-and-returns.md) — remove if not applicable.

For each workflow, document triggers, preconditions, API calls, state transitions, side effects, success conditions, duplicate handling, and recovery/reconciliation. Link every provider-specific claim to its official source.

## Reliability, limits, and recovery

Document behavior that matters in production: pagination and cursor lifetime; polling or event delivery; duplicate and out-of-order events; idempotency; request timeouts; retryable versus permanent errors; throttling; batch and payload limits; partial success; processing status; reconciliation; and manual recovery. Distinguish hard provider limits from recommendations. If a value is dynamic, explain how to discover current limits and do not hardcode a stale number.

## Security and privacy

Apply least privilege. Request only data needed for the use case. Explain any restricted roles, sensitive fields, retention, redaction, access logging, credential rotation, webhook verification, and deletion expectations relevant to this API. Never store secrets in this repository. Use synthetic values in examples and fixtures. This guide is engineering documentation, not legal advice.

## Testing and verification

State exactly what was tested and what was not. Describe sandbox/mocks and their limitations. Include test cases for invalid permissions, token expiry, throttling, pagination, duplicates, out-of-order events, partial batch failure, schema changes, regional differences, and reconciliation as applicable.

| Claim or test | Evidence label | Source or environment | API version / region | Checked |
|---|---|---|---|---|
| [claim] | Official / Tested / Unverified | [link or test summary] | [scope] | YYYY-MM-DD |

- **Official:** stated by an official provider source; link and date required.
- **Tested:** observed in an authorized test environment; state the scenario and limits of the test.
- **Unverified:** not confirmed; keep visibly qualified and do not present as fact.

## Known limitations and open questions

List account restrictions, region gaps, feature limitations, performance caveats, unsupported transitions, unclear behavior, and questions requiring provider confirmation. Assign a next verification step where practical. Do not fill gaps by inference.

## Operational checklist

Before calling this guide production-ready, confirm that required permissions are approved, secrets are safely stored, rate limits and retries are handled, event/polling recovery exists, sensitive data is protected, schema/API deprecations are monitored, and support/escalation paths are known.

## Change history

See [`changelog.md`](changelog.md). Add a dated entry when the provider changes an API or when material claims are reverified. Keep old behavior only when useful, and label it deprecated.

## Source and reuse note

This repository contains original summaries and links, not a mirror of provider documentation. Respect provider terms and intellectual-property rights. Third-party libraries, screenshots, logos, code, or API examples may have separate licenses; include them only when redistribution is permitted.
