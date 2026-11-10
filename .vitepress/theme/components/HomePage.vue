<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { formatDisplayDate } from '../../../scripts/format-date.mjs'
import { noun, statusName } from '../../../scripts/labels.mjs'
import { integrationPath as path } from '../../../scripts/site-links.mjs'
import { coverage, marketplaces } from '../generated/catalog.mjs'
import MarketplaceLogo from './MarketplaceLogo.vue'
import WorkflowDemo from './WorkflowDemo.vue'

type Marketplace = {
  id: string
  name: string
  categoryLabel: string
  regions: string[]
  status: string
  summary: string
  apis: string[]
  guide: string
  lastVerified: string | null
  mark: string
  logo: { hex: string; path: string; tone: string } | null
}

const catalog = marketplaces as Marketplace[]

// "Catalog verified" says what was checked: the catalog entry, not a live integration.
const verifiedText = (value: string | null) => {
  const date = formatDisplayDate(value)
  return date ? `Catalog verified ${date}` : 'Catalog not yet verified'
}

// The catalog grows over time, so the homepage shows the most recently verified few and links to the directory.
const featured = computed(() =>
  [...catalog].sort((a, b) => String(b.lastVerified ?? '').localeCompare(String(a.lastVerified ?? ''))).slice(0, 6),
)

// Each published page is counted once, by its folder (apis/, workflows/, guides/).
const stats = [
  { value: catalog.length, label: noun(catalog.length, 'marketplace') },
  { value: coverage.apiReferencePages, label: noun(coverage.apiReferencePages, 'API reference page') },
  { value: coverage.workflowGuides, label: noun(coverage.workflowGuides, 'workflow guide') },
  { value: coverage.integrationGuides, label: noun(coverage.integrationGuides, 'integration guide') },
]

</script>

<template>
  <div class="mip-home">
    <section class="mip-home-hero">
      <div class="mip-home-wrap mip-home-hero-grid">
        <div class="mip-home-copy">
          <h1>Build marketplace integrations from the official APIs</h1>
          <p class="mip-home-lede">
            Source-linked API references, step-by-step workflows, and sample payloads for connecting seller accounts,
            syncing orders, and keeping listings in step.
          </p>
          <div class="mip-home-actions">
            <a class="mip-btn mip-btn--primary" :href="withBase('/marketplaces/')">Browse marketplaces</a>
            <a class="mip-btn" :href="withBase('/docs/integration-principles')">Read the principles</a>
          </div>
          <ul class="mip-home-stats" aria-label="Current coverage">
            <li v-for="stat in stats" :key="stat.label"><strong>{{ stat.value }}</strong>{{ stat.label }}</li>
          </ul>
        </div>
        <WorkflowDemo />
      </div>
    </section>

    <section class="mip-home-section">
      <div class="mip-home-wrap">
        <header class="mip-home-head">
          <div>
            <h2>Marketplaces</h2>
            <p>Each guide states its scope, access model, regions, and official sources.</p>
          </div>
          <a class="mip-home-more" :href="withBase('/marketplaces/')">View all {{ catalog.length }} in the directory</a>
        </header>
        <div class="mip-market-grid">
          <a v-for="marketplace in featured" :key="marketplace.id" class="mip-market-card" :href="withBase(marketplace.guide)">
            <span class="mip-market-top">
              <MarketplaceLogo :logo="marketplace.logo" :mark="marketplace.mark" size="md" />
              <span class="mip-market-name">{{ marketplace.name }}</span>
              <span class="mip-badge" :class="`mip-badge--${marketplace.status}`">{{ statusName(marketplace.status) }}</span>
            </span>
            <span class="mip-market-summary">{{ marketplace.summary }}</span>
            <span class="mip-market-facts">
              <span>{{ marketplace.categoryLabel }}</span>
              <span>{{ marketplace.apis.length }} API surfaces in the catalog</span>
              <span>{{ verifiedText(marketplace.lastVerified) }}</span>
            </span>
          </a>
        </div>
      </div>
    </section>

    <section class="mip-home-section mip-home-section--mist">
      <div class="mip-home-wrap">
        <header class="mip-home-head">
          <div>
            <h2>The integration path</h2>
            <p>Build in the order a production integration needs. The worked example is Amazon SP-API.</p>
          </div>
        </header>
        <ol class="mip-path">
          <li v-for="(step, index) in path" :key="step.title">
            <span class="mip-path-num">{{ index + 1 }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
            <a :href="withBase(step.link)">Read the guide</a>
          </li>
        </ol>
      </div>
    </section>

    <section class="mip-home-section">
      <div class="mip-home-wrap">
        <div class="mip-home-note">
          <h2>Documentation, not a connection</h2>
          <p>
            “Documented” means the linked official reference was reviewed for the stated scope. Nothing here claims a
            live integration or a sandbox test, and example payloads are illustrative, not captured from a live account.
          </p>
          <a :href="withBase('/docs/lifecycle-and-status')">How evidence status works</a>
        </div>
      </div>
    </section>
  </div>
</template>
