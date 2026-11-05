---
layout: home
hero:
  name: Marketplace Integration Playbook
  text: Build integrations with clarity
  tagline: Source-linked API guides for seller authorization, data migration, synchronization, and operations.
  image:
    src: /marketplace-integration-cover.png
    alt: Marketplace channels connected to an integration hub and business systems
  actions:
    - theme: brand
      text: Start with Amazon
      link: /marketplaces/amazon/
    - theme: alt
      text: Browse API directory
      link: /marketplaces/amazon/apis/
features:
  - title: Connect accounts safely
    details: Understand app registration, seller consent, authorization, roles, regional routing, and verified connection states.
  - title: Migrate before syncing
    details: Capture a seller listing baseline, separate catalog facts from offers, validate product types, stage writes, and reconcile.
  - title: Build from evidence
    details: Follow official provider sources and distinguish documented behavior from engineering recommendations and untested assumptions.
---

# A developer-first path

Use this playbook in the order an integration is usually built. Start with account scope and permissions. Connect and verify the seller. Import existing data before enabling continuous writes. Then add eventing, reconciliation, monitoring, and recovery.

1. **ACCESS — [Connect a seller account](/marketplaces/amazon/guides/seller-onboarding).** Register the app, handle consent and OAuth securely, then verify marketplace access.
2. **MIGRATE — [Import existing listings](/marketplaces/amazon/workflows/active-listing-migration).** Build a baseline, enrich catalog data, validate schemas, stage writes, and reconcile.
3. **DESIGN — [Map the APIs together](/marketplaces/amazon/apis/).** See which API surfaces read listings, enrich products, submit changes, and signal outcomes.
4. **OPERATE — [Build reliable sync](/marketplaces/amazon/guides/development-guide).** Plan rate limits, retries, observability, testing, and safe reauthorization.

## One marketplace is currently documented

The repository currently has an Amazon SP-API guide. Amazon's official models directory showed 57 API/model-family entries in the 2026-11-05 snapshot, including seller-only, vendor-only, and special-purpose entries. The count is not an operation count and does not imply that every entry applies to every seller. The [Amazon directory page](/marketplaces/amazon/apis/) explains the method and current guide coverage.

This independent resource is not an official Amazon guide. A documented API is not proof that an integration exists, and the repository does not claim to connect to any seller account.
