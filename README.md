# Marketplace Integration Playbook

[![Documentation quality](https://github.com/muhammadrakib2299/Marketplace-integration-playbook/actions/workflows/docs-quality.yml/badge.svg)](https://github.com/muhammadrakib2299/Marketplace-integration-playbook/actions/workflows/docs-quality.yml)

![Abstract illustration of marketplace channels connecting through an integration hub to warehouse and data systems](public/marketplace-integration-cover.png)

A community-maintained, source-linked handbook for designing marketplace integrations. It covers Amazon SP-API in depth and TikTok Shop Partner API at the API-family level. Browse the [developer-first documentation site](https://marketplace-integration-playbook.vercel.app/) or explore the source here.

## Start with the Amazon developer journey

Amazon SP-API has the most detailed coverage. Follow the order a production integration should be designed:

1. [Review the Amazon API directory and cross-API map](marketplaces/amazon/apis/index.md).
2. [Register and connect a seller account](marketplaces/amazon/guides/seller-onboarding.md).
3. [Migrate existing seller listings and reconcile the baseline](marketplaces/amazon/workflows/active-listing-migration.md).
4. [Build the development and operations layer](marketplaces/amazon/guides/development-guide.md).
5. Add [order synchronization](marketplaces/amazon/workflows/order-lifecycle.md) and [seller-fulfilled listing/inventory updates](marketplaces/amazon/workflows/inventory-and-listings.md) as separate data flows.

Amazon's official SP-API Models directory listed **57 API/model-family entries in the 2026-11-05 snapshot**. That count includes vendor-only and special-purpose entries; it is not an operation count or a statement that every API applies to every seller. The site identifies which API surfaces have detailed coverage and which remain mapped but not yet reviewed operation-by-operation.

## TikTok Shop Partner API

The TikTok Shop guide maps the official TTS API families and covers the core seller integration path. Start with the [API directory and workflow map](marketplaces/tiktok-shop/apis/index.md), then the [development guide](marketplaces/tiktok-shop/guides/development-guide.md) and the [authorization and token lifecycle](marketplaces/tiktok-shop/apis/authorization.md). It is an official-documentation review only; no TikTok Shop app authorization, sandbox, or production call has been tested.

## Publication and evidence rules

This repository is independent and is not an official guide or endorsement by Amazon or another provider. A documented API does not mean a connection has been implemented or tested.

Only publish material authorized for public release. Do not upload confidential or employer-owned material, private source code, customer or personal data, credentials, access tokens, non-public API documents, or copied documentation without redistribution rights. Prefer short original explanations linked to official sources. Internal policies, architecture, contact details, retention schedules, and security claims require authorization and verification before publication.

Every guide should identify its source, API version, marketplace/region, access requirements, evidence status, review date, and limits. Separate official requirements from engineering recommendations and unverified assumptions. Do not claim sandbox/production testing unless the environment and test scope are recorded.

## Repository structure

- `catalog/marketplaces.yaml` is the machine-readable marketplace index; `catalog/guides.yaml` files each guide under an integration topic, which drives each marketplace's coverage on its overview page and in the directory.
- `marketplaces/amazon/` and `marketplaces/tiktok-shop/` contain each marketplace's API map, guides, and workflows.
- `marketplaces/_template/` is a reusable starting point for future marketplaces.
- `docs/` contains repository-wide integration principles and lifecycle guidance.
- `scripts/` generates the site's sidebar, directory, overview-page, and homepage data from the catalog; `tests/` covers it.
- `.github/workflows/` contains documentation quality checks.

## Add a marketplace

1. Copy `marketplaces/_template/` to `marketplaces/<slug>/`. Use a lowercase, hyphenated slug; it becomes the page URL.
2. Add an entry to `catalog/marketplaces.yaml`, starting from [`templates/marketplace.yaml`](templates/marketplace.yaml), with `guide: ../marketplaces/<slug>/README.md`.
3. List the marketplace's guides in [`catalog/guides.yaml`](catalog/guides.yaml) so they count toward the marketplace's topic coverage on its overview page and in the directory.
4. Add the sidebar links to the catalog entry: `build_sequence` for numbered steps and `pages` for the rest. Optionally add a `logo` (a Simple Icons slug; without one, the marketplace shows a monogram) and a `docs_home` link to the provider's official developer documentation.
5. Run `npm test` and `npm run docs:build`. The build fails if a catalog or guide link has no matching page.

The marketplace directory and homepage cards are generated from the catalog, so they need no manual edits. See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/github-actions.md`](docs/github-actions.md) before contributing. Use the official provider references linked in each guide as the source of truth.
