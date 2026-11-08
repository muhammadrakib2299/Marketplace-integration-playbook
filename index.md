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
  - icon:
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M8 12h8M12 8v8"/></svg>'
    title: Connect with confidence
    details: Understand app registration, seller consent, authorization, roles, regional routing, and verified connection states.
  - icon:
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v14H4zM8 9h8M8 13h5M8 17h3"/><path d="m16 15 2 2 3-4"/></svg>'
    title: Migrate before syncing
    details: Capture a seller listing baseline, separate catalog facts from offers, validate product types, stage writes, and reconcile.
  - icon:
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>'
    title: Build from evidence
    details: Follow official provider sources and distinguish documented behavior from engineering recommendations and untested assumptions.
---
<!-- markdownlint-disable MD033 -->

<div class="home-intro">
  <div class="eyebrow"><span class="eyebrow-mark"></span> A practical path from first consent to reliable operations</div>
  <h2>A developer-first path</h2>
  <p>Build in the order integrations actually need: understand account scope, establish a verified connection, import existing data, and only then enable continuous writes.</p>
</div>

<div class="journey-grid">
  <a class="journey-card" href="/marketplaces/amazon/guides/seller-onboarding">
    <span class="journey-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 11l2 2 4-5"/></svg></span>
    <span class="journey-meta">01 <span>ACCESS</span></span>
    <strong>Connect a seller account</strong>
    <span>Register the app, handle consent and OAuth securely, then verify marketplace access.</span>
    <span class="journey-link">Explore onboarding <span aria-hidden="true">↗</span></span>
  </a>
  <a class="journey-card" href="/marketplaces/amazon/workflows/active-listing-migration">
    <span class="journey-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h4"/><path d="m15 16 2 2 3-3"/></svg></span>
    <span class="journey-meta">02 <span>MIGRATE</span></span>
    <strong>Import existing listings</strong>
    <span>Build a baseline, enrich catalog data, validate schemas, stage writes, and reconcile.</span>
    <span class="journey-link">Explore migration <span aria-hidden="true">↗</span></span>
  </a>
  <a class="journey-card" href="/marketplaces/amazon/apis/">
    <span class="journey-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8 4 12l4 4M16 8l4 4-4 4M14 5l-4 14"/></svg></span>
    <span class="journey-meta">03 <span>DESIGN</span></span>
    <strong>Map the APIs together</strong>
    <span>See which API surfaces read listings, enrich products, submit changes, and signal outcomes.</span>
    <span class="journey-link">Browse API directory <span aria-hidden="true">↗</span></span>
  </a>
  <a class="journey-card" href="/marketplaces/amazon/guides/development-guide">
    <span class="journey-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 2.7 6.4M3 18v-6h6"/><path d="M12 7v5l3 2"/></svg></span>
    <span class="journey-meta">04 <span>OPERATE</span></span>
    <strong>Build reliable sync</strong>
    <span>Plan rate limits, retries, observability, testing, reconciliation, and safe reauthorization.</span>
    <span class="journey-link">Read the development guide <span aria-hidden="true">↗</span></span>
  </a>
</div>

<div class="home-note">
  <span class="note-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg></span>
  <div><strong>One marketplace is currently documented</strong><p>The repository currently has an Amazon SP-API guide. The official models directory showed 57 API/model-family entries in the 2026-11-05 snapshot. This is not an operation count and does not imply every entry applies to every seller. <a href="/marketplaces/amazon/apis/">See how the directory is scoped.</a></p></div>
</div>

<p class="home-disclaimer">An independent developer resource—not an official Amazon guide. Documentation is not proof of a live integration, and this repository does not connect to seller accounts.</p>
