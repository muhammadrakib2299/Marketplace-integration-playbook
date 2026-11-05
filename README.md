# Marketplace Integration Playbook

[![Documentation quality](https://github.com/muhammadrakib2299/Marketplace-integration-playbook/actions/workflows/docs-quality.yml/badge.svg)](https://github.com/muhammadrakib2299/Marketplace-integration-playbook/actions/workflows/docs-quality.yml)

![Abstract illustration of marketplace channels connecting through an integration hub to warehouse and data systems](public/marketplace-integration-cover.png)

A community-maintained, source-linked handbook for designing marketplace integrations. Browse the [developer-first documentation site](https://marketplace-integration-playbook.vercel.app/) or explore the source here.

## Start with the Amazon developer journey

The current detailed marketplace guide is for Amazon SP-API. Follow the order a production integration should be designed:

1. [Review the Amazon API directory and cross-API map](marketplaces/amazon/apis/).
2. [Register and connect a seller account](marketplaces/amazon/guides/seller-onboarding).
3. [Migrate existing seller listings and reconcile the baseline](marketplaces/amazon/workflows/active-listing-migration).
4. [Build the development and operations layer](marketplaces/amazon/guides/development-guide).
5. Add [order synchronization](marketplaces/amazon/workflows/order-lifecycle) and [seller-fulfilled listing/inventory updates](marketplaces/amazon/workflows/inventory-and-listings) as separate data flows.

Amazon's official SP-API Models directory listed **57 API/model-family entries in the 2026-11-05 snapshot**. That count includes vendor-only and special-purpose entries; it is not an operation count or a statement that every API applies to every seller. The site identifies which API surfaces have detailed coverage and which remain mapped but not yet reviewed operation-by-operation.

## Publication and evidence rules

This repository is independent and is not an official guide or endorsement by Amazon or another provider. A documented API does not mean a connection has been implemented or tested.

Only publish material authorized for public release. Do not upload confidential or employer-owned material, private source code, customer or personal data, credentials, access tokens, non-public API documents, or copied documentation without redistribution rights. Prefer short original explanations linked to official sources. Internal policies, architecture, contact details, retention schedules, and security claims require authorization and verification before publication.

Every guide should identify its source, API version, marketplace/region, access requirements, evidence status, review date, and limits. Separate official requirements from engineering recommendations and unverified assumptions. Do not claim sandbox/production testing unless the environment and test scope are recorded.

## Repository structure

- `catalog/` contains the machine-readable marketplace index.
- `marketplaces/amazon/` contains the current Amazon API map, guides, and workflows.
- `marketplaces/_template/` is a reusable starting point for future marketplaces.
- `docs/` contains repository-wide integration principles and lifecycle guidance.
- `.github/workflows/` contains documentation quality checks.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/github-actions.md`](docs/github-actions.md) before contributing. Use the official provider references linked in each guide as the source of truth.
