# Marketplace Integration Playbook

[![Documentation quality](https://github.com/muhammadrakib2299/Marketplace-integration-playbook/actions/workflows/docs-quality.yml/badge.svg)](https://github.com/muhammadrakib2299/Marketplace-integration-playbook/actions/workflows/docs-quality.yml)

![Abstract illustration of marketplace channels connecting through an integration hub to warehouse and data systems](public/marketplace-integration-cover.png)

A community-maintained, source-linked handbook for understanding and building integrations with e-commerce marketplaces and sales channels.

Browse the [searchable documentation site](https://marketplace-integration-playbook.vercel.app/) or use this repository as the source for guides and contributions.

This repository organizes public API references, integration design guidance, workflow notes, and implementation checklists in a repeatable format. Marketplace rules and APIs change; every entry should identify its sources, access requirements, region, and last verification date.

> **Independent resource:** This repository is not affiliated with, endorsed by, or an official guide for any marketplace, platform, employer, or integration vendor unless explicitly stated and authorized. Product names belong to their respective owners.

## What belongs here

- Original technical explanations based on public documentation and authorized experience.
- Links to official API documentation, changelogs, support pages, and partner programs.
- General integration patterns, workflow diagrams, sanitized examples, and checklists.
- Carefully labeled observations that explain whether a fact is official, tested, or still unverified.

Do not upload confidential or employer-owned material, private source code, customer or personal data, credentials, access tokens, non-public API documents, or copied documentation that you do not have permission to redistribute. Prefer concise summaries and links to the original source. Confirm your employment, confidentiality, intellectual-property, and API terms before publishing work derived from a job.

## Repository layout

```text
.
├── README.md
├── CONTRIBUTING.md
├── catalog/
│   ├── marketplaces.yaml       # one-row-per-channel index and status
│   └── categories.yaml         # shared taxonomy, if needed
├── docs/
│   ├── glossary.md
│   ├── github-actions.md
│   ├── integration-principles.md
│   └── lifecycle-and-status.md
├── templates/
│   └── marketplace.yaml        # structured catalog entry
├── marketplaces/
│   ├── _template/              # canonical folder template; not a real integration
│   │   ├── README.md
│   │   ├── guides/
│   │   ├── workflows/
│   │   └── examples/
│   ├── amazon/                 # initial, source-linked SP-API guide
│   └── <marketplace-slug>/
│       ├── README.md           # overview, scope, status, source index
│       ├── guides/
│       │   ├── development-guide.md
│       │   ├── authentication.md
│       │   ├── data-mapping.md
│       │   └── testing-and-release.md
│       ├── workflows/
│       │   ├── order-lifecycle.md
│       │   ├── inventory-and-listings.md
│       │   └── fulfilment-and-returns.md
│       ├── examples/            # only sanitized, clearly labeled examples
│       └── changelog.md         # optional: changes to this repo's notes
└── .github/
    ├── workflows/docs-quality.yml # Markdown and link validation
    └── dependabot.yml             # weekly GitHub Actions updates
```

Create one folder per **distinct API/integration surface**, not one per country, product category, or sales campaign. If regional variants share the same API, document them in one folder with explicit region sections. If authentication, endpoints, or lifecycle behavior materially differ, split into subfolders (for example `marketplaces/example/uk/` and `marketplaces/example/eu/`) and link them from a parent overview. For multiple marketplace brands sharing a platform (such as a marketplace operator), document the shared platform once and add brand-specific notes only where behavior differs.

## Find an integration

See [`catalog/marketplaces.yaml`](catalog/marketplaces.yaml) for the machine-readable index and its status definitions. Browse [`marketplaces/`](marketplaces/) for the full guides, including the initial [Amazon SP-API guide](marketplaces/amazon/README.md). Use the official provider documentation linked in each entry as the source of truth.

The automated Markdown and link checks are described in [`docs/github-actions.md`](docs/github-actions.md).

## Add a marketplace

1. **Check permission and scope.** Use only public information and material you are authorized to publish. Confirm whether the target is a marketplace, storefront, marketplace operator, aggregator, or sales channel.
2. **Research official sources.** Find the provider's developer portal, API reference, authentication guide, changelog, sandbox instructions, and partner/access policy. Record inaccessible or partner-only material as such; never imply public access where approval is required.
3. **Create a candidate entry.** Add a row to `catalog/marketplaces.yaml` with status `research`, region, category, access model, primary docs URL, and verification date. A name in the catalog is not evidence of an implemented integration.
4. **Create the folder.** Copy `marketplaces/_template/` to a stable lowercase, hyphenated slug. Follow the README and development-guide templates. Keep unrelated marketplaces out of the same guide.
5. **Document the real lifecycle.** Cover authorization, initial setup, reads/writes, state transitions, retries, reconciliation, and failure handling—not only a list of endpoints.
6. **Verify claims.** Cite official sources inline. Distinguish provider-documented behavior from your tested observations and from assumptions. Record API version, market/region, verification date, and any access prerequisites.
7. **Check publication safety.** Remove secrets, personal/customer data, proprietary code, and copied text or assets without redistribution rights. Use synthetic examples and placeholders.
8. **Validate and submit.** Check links, YAML syntax, naming, status, and required sections. Open a pull request describing sources checked, scope, testing performed, and any unresolved questions.

## Status and evidence

Use statuses conservatively:

- `research`: candidate only; details have not been sufficiently verified.
- `documented`: a useful guide exists and core claims have official sources.
- `tested`: the described behavior was tested using an authorized sandbox or account; say what was and was not tested.
- `deprecated`: the API or approach is retired or no longer recommended; preserve historical notes only when useful.
- `blocked`: access, permission, or missing information prevents verification; explain the blocker without speculating.

Never use `integrated` to describe a connection to a specific product unless the repo actually documents and can evidence that implementation—and the publisher is authorized to say so. This repository primarily documents API integration knowledge; make implementation claims precise and attributable.

Evidence labels used in guides:

- **Official:** stated in provider documentation or an official announcement; link and access date required.
- **Tested:** directly observed in an authorized test environment; record environment and date without exposing account details.
- **Unverified:** plausible or reported but not confirmed; mark it prominently and do not present it as a fact.

## Quality bar

A good guide helps another developer answer: Can I access this API? What permissions and regional rules apply? What data moves in each direction? How do I handle duplicates, delays, partial failures, rate limits, and API changes? How can I test safely? Where did each claim come from, and when was it last checked?

See [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), [`SECURITY.md`](SECURITY.md), [`docs/integration-principles.md`](docs/integration-principles.md), and the [marketplace folder template](marketplaces/_template/README.md) before contributing. Use the GitHub issue forms for guide requests or corrections.

## License and reuse

No license is granted to third-party names, logos, API documentation, or other provider-owned material by this repository. Choose and add an appropriate license for your original contributions only after considering the project's intended reuse and any employer or legal constraints. Until a license is added, do not assume others have permission to reuse repository content.
