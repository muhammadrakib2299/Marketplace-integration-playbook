<script setup lang="ts">
const platforms = [
  {
    name: 'Amazon Selling Partner API',
    mark: 'a',
    markClass: 'platform-mark-amazon',
    status: 'Documented · partial scope',
    summary:
      'Seller authorization, listings migration, catalog enrichment, orders, and selected operational API surfaces.',
    tags: ['Seller account', 'North America', 'Europe', 'Far East'],
    scope: 'API map · workflows · onboarding',
    href: '/marketplaces/amazon/',
  },
  {
    name: 'TikTok Shop Partner API',
    mark: 't',
    markClass: 'platform-mark-tiktok',
    status: 'Documented · focused reference',
    summary:
      'A focused reference for Get Authorized Category Assets · 202405, with partner access and scope boundaries called out.',
    tags: ['Partner access', 'Target-market dependent', 'One operation'],
    scope: 'Partner API · operation reference',
    href: '/marketplaces/tiktok-shop/',
  },
]

const coverage = [
  { label: 'Marketplace guides', value: platforms.length.toString().padStart(2, '0'), detail: 'Amazon SP-API and TikTok Shop' },
  { label: 'API reference pages', value: '10', detail: 'Including operation and comparison references' },
  { label: 'Workflow guides', value: '03', detail: 'Migration, inventory, listings, and orders' },
  { label: 'Evidence standard', value: 'Source-linked', detail: 'Documentation is not a claim of a live connection or test.', featured: true },
]

const journeys = [
  {
    number: '01', phase: 'Access', title: 'Connect a seller account',
    description: 'Register the app, handle consent and OAuth securely, then verify marketplace access.',
    cta: 'Explore onboarding', href: '/marketplaces/amazon/guides/seller-onboarding', icon: 'access',
  },
  {
    number: '02', phase: 'Migrate', title: 'Import existing listings',
    description: 'Build a baseline, enrich catalog data, validate schemas, stage writes, and reconcile.',
    cta: 'Explore migration', href: '/marketplaces/amazon/workflows/active-listing-migration', icon: 'migrate',
  },
  {
    number: '03', phase: 'Design', title: 'Map the APIs together',
    description: 'See which surfaces read listings, enrich products, submit changes, and signal outcomes.',
    cta: 'Browse API references', href: '/marketplaces/amazon/apis/', icon: 'design',
  },
  {
    number: '04', phase: 'Operate', title: 'Build reliable sync',
    description: 'Plan rate limits, retries, observability, testing, reconciliation, and safe reauthorization.',
    cta: 'Read the development guide', href: '/marketplaces/amazon/guides/development-guide', icon: 'operate',
  },
]

const foundations = [
  {
    title: 'Integration principles',
    description: 'Bound access, protect credentials, and design around clear ownership and reconciliation.',
    cta: 'Read principles', href: '/docs/integration-principles', icon: 'shield', tone: 'practice-blue',
  },
  {
    title: 'Lifecycle & evidence status',
    description: 'Understand what documented, tested, blocked, and unverified status does—and does not—mean.',
    cta: 'Review status definitions', href: '/docs/lifecycle-and-status', icon: 'clock', tone: 'practice-teal',
  },
  {
    title: 'Schema checks & release',
    description: 'Validate API contracts and keep documentation changes reviewable in CI.',
    cta: 'Explore validation', href: '/docs/api-schema-validation', icon: 'code', tone: 'practice-violet',
  },
]

const principles = [
  { title: 'Provider sources first', detail: 'Claims link to the relevant official reference.' },
  { title: 'Scope made explicit', detail: 'Access, region, and coverage limits stay visible.' },
  { title: 'Evidence is not overstated', detail: 'Documentation is not proof of a live integration.' },
]
</script>

<template>
  <div class="home-dashboard">
    <section class="home-section coverage-section" aria-labelledby="coverage-title">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Coverage overview</span>
          <h2 id="coverage-title">A focused, source-led library</h2>
          <p>Know what is covered—and where the documentation deliberately stops.</p>
        </div>
        <a class="section-action" href="/marketplaces/">Browse the directory <span aria-hidden="true">→</span></a>
      </div>
      <div class="coverage-grid" aria-label="Current documentation coverage">
        <article v-for="item in coverage" :key="item.label" class="coverage-card" :class="{ 'coverage-evidence': item.featured }">
          <span class="coverage-label">{{ item.label }}</span>
          <strong class="coverage-value" :class="{ 'coverage-word': item.featured }">{{ item.value }}</strong>
          <span class="coverage-detail">{{ item.detail }}</span>
        </article>
      </div>
    </section>

    <section class="home-section" aria-labelledby="journey-title">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Recommended sequence</span>
          <h2 id="journey-title">From first consent to reliable sync</h2>
          <p>Build in the order a production integration needs: establish scope, import safely, then operate continuously.</p>
        </div>
      </div>
      <div class="journey-grid">
        <a v-for="step in journeys" :key="step.number" class="journey-card" :href="step.href">
          <span class="journey-icon" aria-hidden="true">
            <svg v-if="step.icon === 'access'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 11l2 2 4-5"/></svg>
            <svg v-else-if="step.icon === 'migrate'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h4"/><path d="m15 16 2 2 3-3"/></svg>
            <svg v-else-if="step.icon === 'design'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8 4 12l4 4M16 8l4 4-4 4M14 5l-4 14"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 2.7 6.4M3 18v-6h6"/><path d="M12 7v5l3 2"/></svg>
          </span>
          <span class="journey-meta"><span class="journey-number">{{ step.number }}</span> {{ step.phase }}</span>
          <strong>{{ step.title }}</strong>
          <span class="journey-description">{{ step.description }}</span>
          <span class="journey-link">{{ step.cta }} <span aria-hidden="true">→</span></span>
        </a>
      </div>
    </section>

    <section class="home-section" aria-labelledby="platforms-title">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Interactive directory</span>
          <h2 id="platforms-title">Search marketplaces and integration guides</h2>
          <p>Filter by content type and topic, or search API names, regions, and capabilities.</p>
        </div>
        <a class="section-action" href="/marketplaces/">Open the full directory <span aria-hidden="true">→</span></a>
      </div>
      <PlaybookExplorer :platforms="platforms" />
    </section>

    <section class="home-section" aria-labelledby="engineering-title">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Engineering foundations</span>
          <h2 id="engineering-title">Make the integration dependable</h2>
          <p>Reusable principles for handling provider change, data quality, and release risk.</p>
        </div>
      </div>
      <div class="practice-grid">
        <a v-for="item in foundations" :key="item.title" class="practice-card" :href="item.href">
          <span class="practice-icon" :class="item.tone" aria-hidden="true">
            <svg v-if="item.icon === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 20 7v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4Z"/><path d="m9 12 2 2 4-4"/></svg>
            <svg v-else-if="item.icon === 'clock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/></svg>
          </span>
          <strong>{{ item.title }}</strong>
          <span>{{ item.description }}</span>
          <span class="practice-link">{{ item.cta }} <span aria-hidden="true">→</span></span>
        </a>
      </div>
    </section>

    <section class="home-section resource-band" aria-labelledby="resources-title">
      <div class="resource-copy">
        <span class="section-kicker">Open handbook</span>
        <h2 id="resources-title">Built to be reviewed and improved</h2>
        <p>Use the site-wide search to find an operation or workflow. Contributions should stay source-linked, scoped, and explicit about what has—and has not—been tested.</p>
        <div class="resource-actions">
          <a class="btn-link btn-primary" href="/docs/glossary">Browse the glossary <span aria-hidden="true">→</span></a>
          <a class="btn-link btn-secondary" href="https://github.com/muhammadrakib2299/Marketplace-integration-playbook/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">Contribution guide <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div class="resource-checklist" aria-label="Playbook principles">
        <div v-for="item in principles" :key="item.title">
          <span class="check-mark" aria-hidden="true">✓</span>
          <span><strong>{{ item.title }}</strong><small>{{ item.detail }}</small></span>
        </div>
      </div>
    </section>

    <aside class="home-disclaimer" aria-label="Coverage disclaimer">
      <span class="disclaimer-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg></span>
      <p><strong>Independent developer resource.</strong> This playbook is not official Amazon or TikTok documentation and does not connect to provider accounts. Coverage is intentionally partial; open a guide for its sources, access requirements, and evidence scope.</p>
    </aside>
  </div>
</template>
